/**
 * Feedback & Support routes
 *
 * POST /v1/report — bug/feedback from learners
 */
const express = require("express");
const admin = require("firebase-admin");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");

const router = express.Router();
const db = admin.firestore();

/**
 * POST /v1/report
 *
 * Body: {
 *   "type": "bug|content|feature",
 *   "message": "The quiz answer seems wrong...",
 *   "context": { "lessonId": "les1", "questionId": "q1" }
 * }
 *
 * Sample response:
 * {
 *   "message": "Report submitted. Thank you!",
 *   "reportId": "rpt_abc123"
 * }
 */
router.post(
  "/report",
  authenticate,
  validate(["type", "message"]),
  async (req, res) => {
    try {
      const { type, message, context } = req.body;
      const uid = req.user.uid;

      const validTypes = ["bug", "content", "feature"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        });
      }

      if (message.length > 5000) {
        return res.status(400).json({ error: "Message must be under 5000 characters." });
      }

      const reportRef = await db.collection("reports").add({
        userId: uid,
        email: req.user.email || "",
        type,
        message,
        context: context || {},
        status: "open",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({
        message: "Report submitted. Thank you!",
        reportId: reportRef.id,
      });
    } catch (err) {
      console.error("POST /v1/report error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

module.exports = router;
