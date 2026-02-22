/**
 * Catalog routes — Modules & Lessons (public read)
 *
 * GET /v1/modules
 * GET /v1/modules/:moduleId
 * GET /v1/modules/:moduleId/lessons
 * GET /v1/lessons
 * GET /v1/lessons/:lessonId
 */
const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

/* ------------------------------------------------------------------ */
/*  Helper: build paginated query                                      */
/* ------------------------------------------------------------------ */
function applyPagination(query, { limit, cursor }) {
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  let q = query.limit(pageSize + 1); // fetch one extra to detect hasMore
  if (cursor) {
    // cursor is the doc ID of the last item from the previous page
    q = q.startAfter(cursor);
  }
  return { q, pageSize };
}

/* ================================================================== */
/*  MODULES                                                            */
/* ================================================================== */

/**
 * GET /v1/modules
 *
 * Query params: level, q, limit, cursor
 *
 * Sample response:
 * {
 *   "data": [
 *     { "id": "mod1", "title": "Intro to Prompting", "level": "beginner", ... }
 *   ],
 *   "pagination": { "limit": 20, "nextCursor": "mod1", "hasMore": false }
 * }
 */
router.get("/modules", async (req, res) => {
  try {
    const { level, q, limit, cursor } = req.query;
    let ref = db.collection("modules").orderBy("createdAt", "desc");

    if (level) {
      ref = ref.where("level", "==", level.toLowerCase());
    }

    const { q: paginatedRef, pageSize } = applyPagination(ref, { limit, cursor });

    const snap = await paginatedRef.get();
    let modules = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Client-side text search filter (Firestore doesn't support full-text)
    if (q) {
      const lower = q.toLowerCase();
      modules = modules.filter(
        (m) =>
          (m.title || "").toLowerCase().includes(lower) ||
          (m.description || "").toLowerCase().includes(lower),
      );
    }

    const hasMore = modules.length > pageSize;
    if (hasMore) modules = modules.slice(0, pageSize);

    return res.status(200).json({
      data: modules,
      pagination: {
        limit: pageSize,
        nextCursor: hasMore ? modules[modules.length - 1].id : null,
        hasMore,
      },
    });
  } catch (err) {
    console.error("GET /v1/modules error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * GET /v1/modules/:moduleId
 *
 * Sample response:
 * {
 *   "id": "mod1",
 *   "title": "Intro to Prompting",
 *   "description": "...",
 *   "level": "beginner",
 *   "tags": ["fundamentals"],
 *   "lessonCount": 5,
 *   "createdAt": "...",
 *   "updatedAt": "..."
 * }
 */
router.get("/modules/:moduleId", async (req, res) => {
  try {
    const doc = await db.collection("modules").doc(req.params.moduleId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Module not found." });
    }

    // Lesson count in this module
    const lessonCountSnap = await db
      .collection("lessons")
      .where("moduleId", "==", req.params.moduleId)
      .count()
      .get();

    return res.status(200).json({
      id: doc.id,
      ...doc.data(),
      lessonCount: lessonCountSnap.data().count,
    });
  } catch (err) {
    console.error("GET /v1/modules/:moduleId error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * GET /v1/modules/:moduleId/lessons
 *
 * Sample response:
 * {
 *   "data": [
 *     { "id": "les1", "title": "Lesson 1", "order": 1, "level": "beginner", ... }
 *   ],
 *   "pagination": { "limit": 20, "nextCursor": null, "hasMore": false }
 * }
 */
router.get("/modules/:moduleId/lessons", async (req, res) => {
  try {
    const { limit, cursor } = req.query;
    const moduleId = req.params.moduleId;

    // Verify module exists
    const moduleDoc = await db.collection("modules").doc(moduleId).get();
    if (!moduleDoc.exists) {
      return res.status(404).json({ error: "Module not found." });
    }

    const ref = db
      .collection("lessons")
      .where("moduleId", "==", moduleId)
      .orderBy("order", "asc");

    const { q: paginatedRef, pageSize } = applyPagination(ref, { limit, cursor });
    const snap = await paginatedRef.get();
    let lessons = snap.docs.map((d) => {
      const data = d.data();
      // Exclude heavy content field from list views
      const { content: _content, ...rest } = data;
      return { id: d.id, ...rest };
    });

    const hasMore = lessons.length > pageSize;
    if (hasMore) lessons = lessons.slice(0, pageSize);

    return res.status(200).json({
      data: lessons,
      pagination: {
        limit: pageSize,
        nextCursor: hasMore ? lessons[lessons.length - 1].id : null,
        hasMore,
      },
    });
  } catch (err) {
    console.error("GET /v1/modules/:moduleId/lessons error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ================================================================== */
/*  LESSONS                                                            */
/* ================================================================== */

/**
 * GET /v1/lessons
 *
 * Query params: level, tag, q, limit, cursor
 *
 * Sample response:
 * {
 *   "data": [
 *     { "id": "les1", "title": "Prompt Foundations", "level": "beginner", ... }
 *   ],
 *   "pagination": { "limit": 20, "nextCursor": null, "hasMore": false }
 * }
 */
router.get("/lessons", async (req, res) => {
  try {
    const { level, tag, q, limit, cursor } = req.query;
    let ref = db.collection("lessons").orderBy("createdAt", "desc");

    if (level) {
      ref = ref.where("level", "==", level);
    }
    if (tag) {
      ref = ref.where("tags", "array-contains", tag);
    }

    const { q: paginatedRef, pageSize } = applyPagination(ref, { limit, cursor });
    const snap = await paginatedRef.get();
    let lessons = snap.docs.map((d) => {
      const data = d.data();
      const { content: _content, ...rest } = data; // exclude heavy content
      return { id: d.id, ...rest };
    });

    if (q) {
      const lower = q.toLowerCase();
      lessons = lessons.filter(
        (l) =>
          (l.title || "").toLowerCase().includes(lower) ||
          (l.description || "").toLowerCase().includes(lower) ||
          (l.tags || []).some((t) => t.toLowerCase().includes(lower)),
      );
    }

    const hasMore = lessons.length > pageSize;
    if (hasMore) lessons = lessons.slice(0, pageSize);

    return res.status(200).json({
      data: lessons,
      pagination: {
        limit: pageSize,
        nextCursor: hasMore ? lessons[lessons.length - 1].id : null,
        hasMore,
      },
    });
  } catch (err) {
    console.error("GET /v1/lessons error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * GET /v1/lessons/:lessonId
 *
 * Returns full content + questions.
 *
 * Sample response:
 * {
 *   "id": "les1",
 *   "title": "Prompt Foundations",
 *   "content": "<full HTML/JSON>",
 *   "level": "beginner",
 *   "tags": ["fundamentals"],
 *   "questions": [
 *     { "id": "q1", "type": "mcq", "prompt": "...", "choices": [...] }
 *   ]
 * }
 */
router.get("/lessons/:lessonId", async (req, res) => {
  try {
    const lessonDoc = await db.collection("lessons").doc(req.params.lessonId).get();
    if (!lessonDoc.exists) {
      return res.status(404).json({ error: "Lesson not found." });
    }

    // Fetch questions sub-collection or top-level questions linked to this lesson
    const questionsSnap = await db
      .collection("questions")
      .where("lessonId", "==", req.params.lessonId)
      .orderBy("createdAt", "asc")
      .get();

    const questions = questionsSnap.docs.map((d) => {
      const data = d.data();
      // Strip answerKey so learners don't see correct answers
      const { answerKey: _answerKey, ...safe } = data;
      return { id: d.id, ...safe };
    });

    return res.status(200).json({
      id: lessonDoc.id,
      ...lessonDoc.data(),
      questions,
    });
  } catch (err) {
    console.error("GET /v1/lessons/:lessonId error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
