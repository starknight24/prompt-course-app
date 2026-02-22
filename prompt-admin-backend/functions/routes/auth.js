/**
 * Auth & Profile routes
 *
 * GET /v1/auth/me — returns current user profile, role, and progress summary.
 */
const express = require("express");
const admin = require("firebase-admin");
const authenticate = require("../middleware/authenticate");

const router = express.Router();
const db = admin.firestore();

/**
 * GET /v1/auth/me
 *
 * Sample response:
 * {
 *   "uid": "abc123",
 *   "email": "user@example.com",
 *   "displayName": "Jane Doe",
 *   "role": "learner",
 *   "createdAt": "2025-06-01T12:00:00.000Z",
 *   "progress": {
 *     "totalLessons": 10,
 *     "completed": 4,
 *     "inProgress": 2,
 *     "percentComplete": 40
 *   }
 * }
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Fetch user doc
    const userDoc = await db.collection("users").doc(uid).get();
    let userData = {};
    if (userDoc.exists) {
      userData = userDoc.data();
    } else {
      // Auto-create user doc on first access
      userData = {
        uid,
        email: req.user.email || "",
        displayName: req.user.name || req.user.email || "",
        role: "learner",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection("users").doc(uid).set(userData);
    }

    // Aggregate progress
    const progressSnap = await db
      .collection("progress")
      .where("userId", "==", uid)
      .get();

    let completed = 0;
    let inProgress = 0;
    progressSnap.forEach((doc) => {
      const d = doc.data();
      if (d.status === "completed") completed++;
      else if (d.status === "in_progress") inProgress++;
    });

    // Total published lessons
    const lessonsSnap = await db
      .collection("lessons")
      .where("published", "==", true)
      .count()
      .get();
    const totalLessons = lessonsSnap.data().count;

    return res.status(200).json({
      uid,
      email: userData.email || req.user.email || "",
      displayName: userData.displayName || "",
      role: userData.role || "learner",
      createdAt: userData.createdAt || null,
      progress: {
        totalLessons,
        completed,
        inProgress,
        percentComplete: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
      },
    });
  } catch (err) {
    console.error("GET /v1/auth/me error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
