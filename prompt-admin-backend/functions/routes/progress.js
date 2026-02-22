/**
 * Progress & Gamification routes
 *
 * POST  /v1/save-progress              — upsert per-lesson status
 * GET   /v1/user-progress              — all progress for current user
 * GET   /v1/stats/overview             — dashboard counters
 * PATCH /v1/lessons/:lessonId/bookmark — toggle bookmark
 */
const express = require("express");
const admin = require("firebase-admin");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");

const router = express.Router();
const db = admin.firestore();

/**
 * POST /v1/save-progress
 *
 * Body: { "lessonId":"...", "status":"in_progress|completed", "percent": 0-100 }
 *
 * Sample response:
 * {
 *   "message": "Progress saved.",
 *   "progressId": "uid_lessonId",
 *   "status": "in_progress",
 *   "percent": 50
 * }
 */
router.post(
  "/save-progress",
  authenticate,
  validate(["lessonId", "status"]),
  async (req, res) => {
    try {
      const { lessonId, status, percent } = req.body;
      const uid = req.user.uid;

      const validStatuses = ["in_progress", "completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const pct = Math.min(Math.max(parseInt(percent, 10) || 0, 0), 100);

      // Upsert using composite key
      const progressId = `${uid}_${lessonId}`;
      await db.collection("progress").doc(progressId).set(
        {
          userId: uid,
          lessonId,
          status,
          percent: pct,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      return res.status(200).json({
        message: "Progress saved.",
        progressId,
        status,
        percent: pct,
      });
    } catch (err) {
      console.error("POST /v1/save-progress error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

/**
 * GET /v1/user-progress
 *
 * Sample response:
 * {
 *   "data": [
 *     {
 *       "id": "uid_les1",
 *       "lessonId": "les1",
 *       "status": "completed",
 *       "percent": 100,
 *       "bookmarked": false,
 *       "updatedAt": "..."
 *     }
 *   ],
 *   "summary": { "completed": 4, "inProgress": 2, "total": 6 }
 * }
 */
router.get("/user-progress", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await db
      .collection("progress")
      .where("userId", "==", uid)
      .orderBy("updatedAt", "desc")
      .get();

    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    let completed = 0;
    let inProgress = 0;
    data.forEach((p) => {
      if (p.status === "completed") completed++;
      else if (p.status === "in_progress") inProgress++;
    });

    return res.status(200).json({
      data,
      summary: { completed, inProgress, total: data.length },
    });
  } catch (err) {
    console.error("GET /v1/user-progress error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * GET /v1/stats/overview
 *
 * Sample response:
 * {
 *   "totalModules": 5,
 *   "totalLessons": 20,
 *   "totalQuestions": 60,
 *   "userCompleted": 4,
 *   "userInProgress": 2,
 *   "userBookmarks": 3,
 *   "streakDays": 0
 * }
 */
router.get("/stats/overview", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Parallel counts
    const [modulesCount, lessonsCount, questionsCount, progressSnap, bookmarkSnap] =
      await Promise.all([
        db.collection("modules").count().get(),
        db.collection("lessons").count().get(),
        db.collection("questions").count().get(),
        db.collection("progress").where("userId", "==", uid).get(),
        db
          .collection("progress")
          .where("userId", "==", uid)
          .where("bookmarked", "==", true)
          .get(),
      ]);

    let completed = 0;
    let inProgress = 0;
    progressSnap.forEach((d) => {
      const s = d.data().status;
      if (s === "completed") completed++;
      else if (s === "in_progress") inProgress++;
    });

    return res.status(200).json({
      totalModules: modulesCount.data().count,
      totalLessons: lessonsCount.data().count,
      totalQuestions: questionsCount.data().count,
      userCompleted: completed,
      userInProgress: inProgress,
      userBookmarks: bookmarkSnap.size,
      streakDays: 0, // placeholder — implement streak logic as needed
    });
  } catch (err) {
    console.error("GET /v1/stats/overview error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * PATCH /v1/lessons/:lessonId/bookmark
 *
 * Body: { "bookmarked": true }
 *
 * Sample response:
 * {
 *   "message": "Bookmark updated.",
 *   "lessonId": "les1",
 *   "bookmarked": true
 * }
 */
router.patch("/lessons/:lessonId/bookmark", authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { bookmarked } = req.body;
    const uid = req.user.uid;

    if (typeof bookmarked !== "boolean") {
      return res
        .status(400)
        .json({ error: "Field 'bookmarked' must be a boolean." });
    }

    // Verify lesson exists
    const lessonDoc = await db.collection("lessons").doc(lessonId).get();
    if (!lessonDoc.exists) {
      return res.status(404).json({ error: "Lesson not found." });
    }

    const progressId = `${uid}_${lessonId}`;
    await db.collection("progress").doc(progressId).set(
      {
        userId: uid,
        lessonId,
        bookmarked,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return res.status(200).json({
      message: "Bookmark updated.",
      lessonId,
      bookmarked,
    });
  } catch (err) {
    console.error("PATCH /v1/lessons/:lessonId/bookmark error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
