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

/* ------------------------------------------------------------------ */
/*  Helper: calculate streak (consecutive days of activity)            */
/* ------------------------------------------------------------------ */

/**
 * Returns the number of consecutive days (up to and including today)
 * that the user had activity in either the `progress` or `responses`
 * collection. We query only the `updatedAt` / `createdAt` fields and
 * limit to 90 docs per collection to keep reads bounded.
 * @param {string} uid - The user ID to calculate streak for.
 * @return {Promise<number>} The streak count in days.
 */
async function calculateStreak(uid) {
  // Fetch recent activity timestamps from both collections in parallel.
  // Order descending so the most recent activity comes first; limit to
  // 90 per collection (~3 months of daily activity is more than enough).
  const [progressSnap, responsesSnap] = await Promise.all([
    db
      .collection("progress")
      .where("userId", "==", uid)
      .orderBy("updatedAt", "desc")
      .limit(90)
      .select("updatedAt")
      .get(),
    db
      .collection("responses")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(90)
      .select("createdAt")
      .get(),
  ]);

  // Collect all activity dates as "YYYY-MM-DD" strings (UTC).
  const dateSet = new Set();

  progressSnap.forEach((doc) => {
    const ts = doc.data().updatedAt;
    if (ts && typeof ts.toDate === "function") {
      dateSet.add(ts.toDate().toISOString().slice(0, 10));
    }
  });

  responsesSnap.forEach((doc) => {
    const ts = doc.data().createdAt;
    if (ts && typeof ts.toDate === "function") {
      dateSet.add(ts.toDate().toISOString().slice(0, 10));
    }
  });

  if (dateSet.size === 0) return 0;

  // Walk backwards from today counting consecutive days.
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // The streak must include today or yesterday (to be forgiving across
  // timezones — if the user was active yesterday but not yet today the
  // streak should still count).
  if (!dateSet.has(todayStr)) {
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (!dateSet.has(yesterdayStr)) {
      return 0; // no recent activity — streak is broken
    }
  }

  // Count consecutive days backwards starting from today.
  let streak = 0;
  const cursor = new Date(now);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (dateSet.has(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  // If the streak didn't start today (i.e. user hasn't been active today
  // but was active yesterday), we started counting from today which would
  // have been a miss. Re-count from yesterday instead.
  if (streak === 0) {
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const cur = new Date(yesterday);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const key = cur.toISOString().slice(0, 10);
      if (dateSet.has(key)) {
        streak++;
        cur.setUTCDate(cur.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

  return streak;
}

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
 *   "streakDays": 5
 * }
 */
router.get("/stats/overview", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Parallel counts (including streak calculation)
    const [modulesCount, lessonsCount, questionsCount, progressSnap, bookmarkSnap, streakDays] =
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
        calculateStreak(uid),
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
      streakDays,
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
