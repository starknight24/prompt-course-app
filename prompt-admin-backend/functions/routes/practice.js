/**
 * Practice / Response routes
 *
 * POST /v1/submit-response — learner submits an answer
 * POST /v1/llm-feedback   — formative feedback / hints from LLM
 */
const express = require("express");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const config = require("../config");

/* ------------------------------------------------------------------ */
/*  OpenAI client (lazy-initialized)                                   */
/* ------------------------------------------------------------------ */
let openaiClient = null;

function getOpenAIClient() {
  if (!config.openai.apiKey) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openaiClient;
}

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

      // Try OpenAI-powered feedback, fall back to templates if unavailable
      const client = getOpenAIClient();
      if (client) {
        try {
          const llmResult = await getLLMFeedback(client, question, answer, mode);
          return res.status(200).json(llmResult);
        } catch (llmErr) {
          console.error("OpenAI API call failed, falling back to templates:", llmErr.message);
        }
      } else if (!config.openai.apiKey) {
        console.warn("OPENAI_API_KEY is not set — using template-based feedback fallback.");
      }

      // Template-based fallback
      const fallback = getTemplateFeedback(question, answer, mode);
      return res.status(200).json(fallback);
    } catch (err) {
      console.error("POST /v1/llm-feedback error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

/* ------------------------------------------------------------------ */
/*  OpenAI-powered feedback                                            */
/* ------------------------------------------------------------------ */
const SYSTEM_PROMPTS = {
  hint: `You are a helpful teaching assistant for a prompt engineering course.
The student is stuck on a practice question. Give them a useful hint
that nudges them toward the right answer WITHOUT revealing it directly.
Keep your hint concise (2-4 sentences). Be encouraging.`,

  rubric: `You are an expert grading assistant for a prompt engineering course.
Evaluate the student's answer against the question and correct answer.
Provide a clear rubric-style evaluation covering:
- Relevance: Does the answer address what was asked?
- Completeness: Are all key aspects covered?
- Accuracy: Is the information correct?
Give specific, actionable feedback. Be fair but constructive.`,

  improve: `You are a constructive teaching assistant for a prompt engineering course.
The student has submitted an answer. Suggest specific, actionable improvements they can make.
Focus on what they can do better rather than what they did wrong.
Keep suggestions concrete and tied to the question context.`,
};

async function getLLMFeedback(client, question, answer, mode) {
  const questionText = question.prompt || question.question || "Unknown question";
  const correctAnswer = (question.answerKey || []).join(", ");
  const options = question.options ?
    question.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("\n") :
    "";

  let userMessage = `Question: ${questionText}`;
  if (options) {
    userMessage += `\n\nOptions:\n${options}`;
  }
  userMessage += `\n\nStudent's answer: ${answer}`;
  if (mode !== "hint" && correctAnswer) {
    userMessage += `\n\nCorrect answer: ${correctAnswer}`;
  }

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPTS[mode] },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 512,
  });

  const feedbackText = completion.choices[0].message.content.trim();

  // Parse suggested improvements from the LLM response
  const suggestedImprovements = extractImprovements(feedbackText, mode);

  return {
    feedback: feedbackText,
    suggested_improvements: suggestedImprovements,
  };
}

/**
 * Extract actionable improvement bullet points from LLM feedback text.
 * @param {string} feedbackText - The LLM feedback text to parse.
 * @param {string} mode - The feedback mode (hint, rubric, improve).
 * @return {Array<string>} Array of improvement suggestions.
 */
function extractImprovements(feedbackText, mode) {
  if (mode === "hint") {
    return ["Review the lesson content", "Think about the key concepts"];
  }

  // Try to extract numbered or bulleted items from the response
  const lines = feedbackText.split("\n");
  const improvements = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Match lines starting with -, *, or numbered items like "1." "2."
    if (/^[-*•]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
      const cleaned = trimmed.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
      if (cleaned.length > 10 && cleaned.length < 200) {
        improvements.push(cleaned);
      }
    }
  }

  return improvements.length > 0 ?
    improvements.slice(0, 5) :
    ["Review the feedback above and revise your answer"];
}

/* ------------------------------------------------------------------ */
/*  Template-based fallback feedback                                   */
/* ------------------------------------------------------------------ */
function getTemplateFeedback(question, answer, mode) {
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

  return {
    feedback,
    suggested_improvements: suggestedImprovements,
  };
}

module.exports = router;
