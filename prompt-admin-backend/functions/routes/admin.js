/**
 * Admin routes (role=admin, protected)
 *
 * All routes require authenticate + requireAdmin middleware.
 *
 * GET    /v1/admin/check
 * POST   /v1/admin/modules
 * PUT    /v1/admin/modules/:moduleId
 * DELETE /v1/admin/modules/:moduleId
 * POST   /v1/admin/lessons
 * PUT    /v1/admin/lessons/:lessonId
 * DELETE /v1/admin/lessons/:lessonId
 * POST   /v1/admin/lessons/:lessonId/questions
 * PUT    /v1/admin/questions/:questionId
 * DELETE /v1/admin/questions/:questionId
 * POST   /v1/admin/bulk-import
 * POST   /v1/admin/publish-lesson
 * GET    /v1/admin/analytics/engagement
 */
const express = require("express");
const admin = require("firebase-admin");
const authenticate = require("../middleware/authenticate");
const requireAdmin = require("../middleware/requireAdmin");
const validate = require("../middleware/validate");

const router = express.Router();
const db = admin.firestore();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

/* ================================================================== */
/*  ADMIN CHECK                                                        */
/* ================================================================== */

/**
 * GET /v1/admin/check
 *
 * Sample response:
 * { "isAdmin": true }
 */
router.get("/check", (_req, res) => {
  return res.status(200).json({ isAdmin: true });
});

/* ================================================================== */
/*  MODULE CRUD                                                        */
/* ================================================================== */

/**
 * POST /v1/admin/modules
 *
 * Body: { "title":"...", "description":"...", "level":"beginner|intermediate|advanced", "tags":["..."] }
 *
 * Sample response:
 * { "id": "mod_abc", "message": "Module created.", "createdAt": "..." }
 */
router.post("/modules", validate(["title", "description", "level"]), async (req, res) => {
  try {
    const { title, description, level, tags } = req.body;

    const validLevels = ["beginner", "intermediate", "advanced"];
    if (!validLevels.includes(level.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid level. Must be one of: ${validLevels.join(", ")}`,
      });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection("modules").add({
      title,
      description,
      level: level.toLowerCase(),
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({
      id: docRef.id,
      message: "Module created.",
    });
  } catch (err) {
    console.error("POST /v1/admin/modules error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * PUT /v1/admin/modules/:moduleId
 *
 * Body: any subset of { "title", "description", "level", "tags" }
 *
 * Sample response:
 * { "message": "Module updated.", "id": "mod_abc" }
 */
router.put("/modules/:moduleId", async (req, res) => {
  try {
    const { moduleId } = req.params;
    const docRef = db.collection("modules").doc(moduleId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Module not found." });
    }

    const allowedFields = ["title", "description", "level", "tags"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.level) {
      const validLevels = ["beginner", "intermediate", "advanced"];
      if (!validLevels.includes(updates.level.toLowerCase())) {
        return res.status(400).json({
          error: `Invalid level. Must be one of: ${validLevels.join(", ")}`,
        });
      }
      updates.level = updates.level.toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update." });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await docRef.update(updates);

    return res.status(200).json({ message: "Module updated.", id: moduleId });
  } catch (err) {
    console.error("PUT /v1/admin/modules/:moduleId error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * DELETE /v1/admin/modules/:moduleId
 *
 * Sample response:
 * { "message": "Module deleted.", "id": "mod_abc" }
 */
router.delete("/modules/:moduleId", async (req, res) => {
  try {
    const { moduleId } = req.params;
    const docRef = db.collection("modules").doc(moduleId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Module not found." });
    }

    await docRef.delete();
    return res.status(200).json({ message: "Module deleted.", id: moduleId });
  } catch (err) {
    console.error("DELETE /v1/admin/modules/:moduleId error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ================================================================== */
/*  LESSON CRUD                                                        */
/* ================================================================== */

/**
 * POST /v1/admin/lessons
 *
 * Body: {
 *   "moduleId":"...", "title":"...", "content":"<HTML/JSON>",
 *   "level":"...", "tags":["..."], "published": true
 * }
 *
 * Sample response:
 * { "id": "les_abc", "message": "Lesson created." }
 */
router.post("/lessons", validate(["title", "content"]), async (req, res) => {
  try {
    const { moduleId, title, content, level, tags, published, description, order, topic, duration } =
      req.body;

    // Validate moduleId if provided
    if (moduleId) {
      const moduleDoc = await db.collection("modules").doc(moduleId).get();
      if (!moduleDoc.exists) {
        return res.status(404).json({ error: "Module not found." });
      }
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection("lessons").add({
      moduleId: moduleId || null,
      title,
      content,
      description: description || "",
      level: level ? level.toLowerCase() : "beginner",
      tags: tags || [],
      published: typeof published === "boolean" ? published : false,
      order: order || 0,
      topic: topic || "",
      duration: duration || "",
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({ id: docRef.id, message: "Lesson created." });
  } catch (err) {
    console.error("POST /v1/admin/lessons error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * PUT /v1/admin/lessons/:lessonId
 *
 * Body: any subset of lesson fields
 *
 * Sample response:
 * { "message": "Lesson updated.", "id": "les_abc" }
 */
router.put("/lessons/:lessonId", async (req, res) => {
  try {
    const { lessonId } = req.params;
    const docRef = db.collection("lessons").doc(lessonId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Lesson not found." });
    }

    const allowedFields = [
      "moduleId",
      "title",
      "content",
      "description",
      "level",
      "tags",
      "published",
      "order",
      "topic",
      "duration",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.level) {
      updates.level = updates.level.toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update." });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await docRef.update(updates);

    return res.status(200).json({ message: "Lesson updated.", id: lessonId });
  } catch (err) {
    console.error("PUT /v1/admin/lessons/:lessonId error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * DELETE /v1/admin/lessons/:lessonId
 *
 * Sample response:
 * { "message": "Lesson deleted.", "id": "les_abc" }
 */
router.delete("/lessons/:lessonId", async (req, res) => {
  try {
    const { lessonId } = req.params;
    const docRef = db.collection("lessons").doc(lessonId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Lesson not found." });
    }

    // Also clean up associated questions
    const questionsSnap = await db
      .collection("questions")
      .where("lessonId", "==", lessonId)
      .get();

    const batch = db.batch();
    batch.delete(docRef);
    questionsSnap.forEach((qDoc) => batch.delete(qDoc.ref));
    await batch.commit();

    return res.status(200).json({ message: "Lesson deleted.", id: lessonId });
  } catch (err) {
    console.error("DELETE /v1/admin/lessons/:lessonId error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ================================================================== */
/*  QUESTION CRUD                                                      */
/* ================================================================== */

/**
 * POST /v1/admin/lessons/:lessonId/questions
 *
 * Body: {
 *   "type": "mcq|short|code",
 *   "prompt": "...",
 *   "choices": [{"id":"A","text":"..."}],
 *   "answerKey": ["B"],
 *   "explanation": "...",
 *   "points": 1
 * }
 *
 * Sample response:
 * { "id": "q_abc", "message": "Question added.", "lessonId": "les1" }
 */
router.post(
  "/lessons/:lessonId/questions",
  validate(["type", "prompt"]),
  async (req, res) => {
    try {
      const { lessonId } = req.params;

      // Verify lesson exists
      const lessonDoc = await db.collection("lessons").doc(lessonId).get();
      if (!lessonDoc.exists) {
        return res.status(404).json({ error: "Lesson not found." });
      }

      const { type, prompt, choices, answerKey, explanation, points } = req.body;

      const validTypes = ["mcq", "short", "code"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        });
      }

      const now = admin.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection("questions").add({
        lessonId,
        type,
        prompt,
        choices: choices || [],
        answerKey: answerKey || [],
        explanation: explanation || "",
        points: typeof points === "number" ? points : 1,
        createdAt: now,
        updatedAt: now,
      });

      return res
        .status(201)
        .json({ id: docRef.id, message: "Question added.", lessonId });
    } catch (err) {
      console.error("POST /v1/admin/lessons/:lessonId/questions error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

/**
 * PUT /v1/admin/questions/:questionId
 *
 * Body: any subset of question fields
 *
 * Sample response:
 * { "message": "Question updated.", "id": "q_abc" }
 */
router.put("/questions/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const docRef = db.collection("questions").doc(questionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Question not found." });
    }

    const allowedFields = ["type", "prompt", "choices", "answerKey", "explanation", "points"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.type) {
      const validTypes = ["mcq", "short", "code"];
      if (!validTypes.includes(updates.type)) {
        return res.status(400).json({
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update." });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await docRef.update(updates);

    return res.status(200).json({ message: "Question updated.", id: questionId });
  } catch (err) {
    console.error("PUT /v1/admin/questions/:questionId error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * DELETE /v1/admin/questions/:questionId
 *
 * Sample response:
 * { "message": "Question deleted.", "id": "q_abc" }
 */
router.delete("/questions/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const docRef = db.collection("questions").doc(questionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Question not found." });
    }

    await docRef.delete();
    return res.status(200).json({ message: "Question deleted.", id: questionId });
  } catch (err) {
    console.error("DELETE /v1/admin/questions/:questionId error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ================================================================== */
/*  BULK IMPORT                                                        */
/* ================================================================== */

/**
 * POST /v1/admin/bulk-import
 *
 * Body: {
 *   "collection": "modules|lessons|questions",
 *   "data": [ { ...doc }, { ...doc } ]
 * }
 *
 * Accepts a JSON array of documents to import into the specified collection.
 *
 * Sample response:
 * {
 *   "message": "Imported 5 documents into lessons.",
 *   "importedCount": 5,
 *   "ids": ["les1", "les2", ...]
 * }
 */
router.post("/bulk-import", validate(["collection", "data"]), async (req, res) => {
  try {
    const { collection: collectionName, data } = req.body;

    const validCollections = ["modules", "lessons", "questions"];
    if (!validCollections.includes(collectionName)) {
      return res.status(400).json({
        error: `Invalid collection. Must be one of: ${validCollections.join(", ")}`,
      });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "'data' must be a non-empty array." });
    }

    if (data.length > 500) {
      return res
        .status(400)
        .json({ error: "Bulk import limited to 500 documents per request." });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();
    const ids = [];

    for (const item of data) {
      const docRef = db.collection(collectionName).doc();
      batch.set(docRef, {
        ...item,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(docRef.id);
    }

    await batch.commit();

    return res.status(201).json({
      message: `Imported ${data.length} documents into ${collectionName}.`,
      importedCount: data.length,
      ids,
    });
  } catch (err) {
    console.error("POST /v1/admin/bulk-import error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ================================================================== */
/*  PUBLISH LESSON                                                     */
/* ================================================================== */

/**
 * POST /v1/admin/publish-lesson
 *
 * Body: { "lessonId":"...", "published": true }
 *
 * Sample response:
 * { "message": "Lesson published.", "lessonId": "les1", "published": true }
 */
router.post("/publish-lesson", validate(["lessonId"]), async (req, res) => {
  try {
    const { lessonId, published } = req.body;

    if (typeof published !== "boolean") {
      return res
        .status(400)
        .json({ error: "Field 'published' must be a boolean." });
    }

    const docRef = db.collection("lessons").doc(lessonId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Lesson not found." });
    }

    await docRef.update({
      published,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      message: published ? "Lesson published." : "Lesson unpublished.",
      lessonId,
      published,
    });
  } catch (err) {
    console.error("POST /v1/admin/publish-lesson error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ================================================================== */
/*  ANALYTICS                                                          */
/* ================================================================== */

/**
 * GET /v1/admin/analytics/engagement
 *
 * Returns aggregated stats per lesson.
 *
 * Sample response:
 * {
 *   "data": [
 *     {
 *       "lessonId": "les1",
 *       "title": "Prompt Foundations",
 *       "totalResponses": 42,
 *       "uniqueUsers": 18,
 *       "avgScore": 0.76,
 *       "completionCount": 15,
 *       "bookmarkCount": 8
 *     }
 *   ]
 * }
 */
router.get("/analytics/engagement", async (_req, res) => {
  try {
    // Get all lessons
    const lessonsSnap = await db.collection("lessons").orderBy("createdAt", "desc").get();
    const engagementData = [];

    for (const lessonDoc of lessonsSnap.docs) {
      const lessonId = lessonDoc.id;
      const lessonData = lessonDoc.data();

      // Responses for this lesson
      const responsesSnap = await db
        .collection("responses")
        .where("lessonId", "==", lessonId)
        .get();

      let totalScore = 0;
      const uniqueUserIds = new Set();
      responsesSnap.forEach((d) => {
        const data = d.data();
        totalScore += data.score || 0;
        uniqueUserIds.add(data.userId);
      });

      // Completion count
      const completionsSnap = await db
        .collection("progress")
        .where("lessonId", "==", lessonId)
        .where("status", "==", "completed")
        .get();

      // Bookmark count
      const bookmarkSnap = await db
        .collection("progress")
        .where("lessonId", "==", lessonId)
        .where("bookmarked", "==", true)
        .get();

      engagementData.push({
        lessonId,
        title: lessonData.title || "",
        totalResponses: responsesSnap.size,
        uniqueUsers: uniqueUserIds.size,
        avgScore:
          responsesSnap.size > 0 ?
            Math.round((totalScore / responsesSnap.size) * 100) / 100 :
            0,
        completionCount: completionsSnap.size,
        bookmarkCount: bookmarkSnap.size,
      });
    }

    return res.status(200).json({ data: engagementData });
  } catch (err) {
    console.error("GET /v1/admin/analytics/engagement error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
