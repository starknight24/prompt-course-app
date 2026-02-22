/**
 * Practice / Response routes
 *
 * POST /v1/submit-response — learner submits an answer
 * POST /v1/llm-feedback   — formative feedback / hints from LLM
 */
const express = require("express");
const admin = require("firebase-admin");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");

const router = express.Router();
const db = admin.firestore();

/* ------------------------------------------------------------------ */
/*  Helper: evaluate answer against answerKey                          */
/* ------------------------------------------------------------------ */
function evaluateAnswer(answer, question) {
  if (!question || !question.answerKey) {
    return { result: "incorrect", score: 0, explanation: "No answer key found for this question." };
  }

  const type = question.type || "mcq";
  let result = "incorrect";
  let score = 0;
  const explanation = question.explanation || "";

  if (type === "mcq") {
    // answerKey is an array like ["B"]
    const correct = (question.answerKey || []).map((k) => k.toUpperCase().trim());
    const given = answer.toUpperCase().trim();
    if (correct.includes(given)) {
      result = "correct";
      score = 1;
    }
  } else if (type === "short" || type === "code") {
    // Loose text matching — normalize and compare
    const correctAnswers = (question.answerKey || []).map((k) => k.toLowerCase().trim());
    const given = (answer || "").toLowerCase().trim();
    if (correctAnswers.includes(given)) {
      result = "correct";
      score = 1;
    } else if (correctAnswers.some((c) => given.includes(c) || c.includes(given))) {
      result = "partial";
      score = 0.5;
    }
  }

  return { result, score, explanation };
}

/**
 * POST /v1/submit-response
 *
 * Body: { "lessonId":"...", "questionId":"...", "answer":"...", "timeMs": 43000 }
 *
 * Sample response:
 * {
 *   "result": "correct",
 *   "score": 1,
 *   "explanation": "Option B is correct because ...",
 *   "nextHintId": null,
 *   "responseId": "resp_abc123"
 * }
 */
router.post(
  "/submit-response",
  authenticate,
  validate(["lessonId", "questionId", "answer"]),
  async (req, res) => {
    try {
      const { lessonId, questionId, answer, timeMs } = req.body;
      const uid = req.user.uid;

      // Verify lesson exists
      const lessonDoc = await db.collection("lessons").doc(lessonId).get();
      if (!lessonDoc.exists) {
        return res.status(404).json({ error: "Lesson not found." });
      }

      // Fetch question with answer key
      const questionDoc = await db.collection("questions").doc(questionId).get();
      if (!questionDoc.exists) {
        return res.status(404).json({ error: "Question not found." });
      }

      const question = questionDoc.data();
      const evaluation = evaluateAnswer(answer, question);

      // Persist the response
      const responseRef = await db.collection("responses").add({
        userId: uid,
        lessonId,
        questionId,
        answer,
        result: evaluation.result,
        score: evaluation.score,
        timeMs: timeMs || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        result: evaluation.result,
        score: evaluation.score,
        explanation: evaluation.explanation,
        nextHintId: null,
        responseId: responseRef.id,
      });
    } catch (err) {
      console.error("POST /v1/submit-response error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

/**
 * POST /v1/llm-feedback
 *
 * Body: { "lessonId":"...", "questionId":"...", "answer":"...", "mode":"hint|rubric|improve" }
 *
 * In production this would call an LLM API. For now, returns structured
 * template-based feedback so the endpoint contract is established.
 *
 * Sample response:
 * {
 *   "feedback": "Consider re-reading the section on role prompting...",
 *   "suggested_improvements": [
 *     "Be more specific about the output format",
 *     "Include an example in your prompt"
 *   ]
 * }
 */
router.post(
  "/llm-feedback",
  authenticate,
  validate(["lessonId", "questionId", "answer", "mode"]),
  async (req, res) => {
    try {
      const { questionId, answer, mode } = req.body;

      const validModes = ["hint", "rubric", "improve"];
      if (!validModes.includes(mode)) {
        return res
          .status(400)
          .json({ error: `Invalid mode. Must be one of: ${validModes.join(", ")}` });
      }

      // Fetch question for context
      const questionDoc = await db.collection("questions").doc(questionId).get();
      if (!questionDoc.exists) {
        return res.status(404).json({ error: "Question not found." });
      }

      const question = questionDoc.data();

      // Template-based feedback (replace with real LLM call in production)
      let feedback = "";
      let suggestedImprovements = [];

      if (mode === "hint") {
        const qPrompt = question.prompt || "the question";
        feedback =
          "Hint: Re-read the lesson material carefully. " +
          `Think about what "${qPrompt}" is really asking. ` +
          "Focus on the key concepts mentioned.";
        suggestedImprovements = [
          "Review the lesson content",
          "Consider each option carefully",
        ];
      } else if (mode === "rubric") {
        feedback =
          `Rubric evaluation for your answer "${answer}":\n` +
          "- Relevance: Does your answer address the question?\n" +
          "- Completeness: Did you consider all aspects?\n" +
          "- Accuracy: Is the information factually correct?";
        suggestedImprovements = [
          "Ensure your answer addresses all parts of the question",
          "Provide specific examples where possible",
          "Check factual accuracy",
        ];
      } else if (mode === "improve") {
        feedback =
          "To improve your answer, consider:\n" +
          "1. Being more specific in your response.\n" +
          "2. Referencing concepts from the lesson material.\n" +
          "3. Structuring your answer more clearly.";
        suggestedImprovements = [
          "Add more specific details",
          "Reference lesson concepts explicitly",
          "Improve answer structure",
        ];
      }

      return res.status(200).json({
        feedback,
        suggested_improvements: suggestedImprovements,
      });
    } catch (err) {
      console.error("POST /v1/llm-feedback error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

module.exports = router;
