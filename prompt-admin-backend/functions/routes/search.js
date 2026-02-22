/**
 * Search & Discovery routes
 *
 * GET /v1/search — unified search across modules and lessons
 */
const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

/**
 * GET /v1/search
 *
 * Query params: q (required), type=lesson|module, limit, cursor
 *
 * Sample response:
 * {
 *   "data": [
 *     { "id": "les1", "type": "lesson", "title": "Prompt Foundations", "description": "...", "level": "beginner" },
 *     { "id": "mod1", "type": "module", "title": "Intro Track", "description": "..." }
 *   ],
 *   "pagination": { "limit": 20, "hasMore": false, "nextCursor": null }
 * }
 */
router.get("/search", async (req, res) => {
  try {
    const { q, type, limit, cursor } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'q' is required." });
    }

    const lower = q.toLowerCase();
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const results = [];

    // Search lessons
    if (!type || type === "lesson") {
      const lessonRef = db.collection("lessons").orderBy("createdAt", "desc").limit(200);
      const lessonSnap = await lessonRef.get();
      lessonSnap.docs.forEach((d) => {
        const data = d.data();
        const matchTitle = (data.title || "").toLowerCase().includes(lower);
        const matchDesc = (data.description || "").toLowerCase().includes(lower);
        const matchTag = (data.tags || []).some((t) => t.toLowerCase().includes(lower));
        if (matchTitle || matchDesc || matchTag) {
          const { content: _content, ...rest } = data;
          results.push({ id: d.id, type: "lesson", ...rest });
        }
      });
    }

    // Search modules
    if (!type || type === "module") {
      const moduleRef = db.collection("modules").orderBy("createdAt", "desc").limit(200);
      const moduleSnap = await moduleRef.get();
      moduleSnap.docs.forEach((d) => {
        const data = d.data();
        const matchTitle = (data.title || "").toLowerCase().includes(lower);
        const matchDesc = (data.description || "").toLowerCase().includes(lower);
        const matchTag = (data.tags || []).some((t) => t.toLowerCase().includes(lower));
        if (matchTitle || matchDesc || matchTag) {
          results.push({ id: d.id, type: "module", ...data });
        }
      });
    }

    // Simple cursor-based pagination over the combined result set
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = results.findIndex((r) => r.id === cursor);
      if (cursorIndex >= 0) startIndex = cursorIndex + 1;
    }

    const page = results.slice(startIndex, startIndex + pageSize + 1);
    const hasMore = page.length > pageSize;
    const finalPage = hasMore ? page.slice(0, pageSize) : page;

    return res.status(200).json({
      data: finalPage,
      pagination: {
        limit: pageSize,
        nextCursor: hasMore ? finalPage[finalPage.length - 1].id : null,
        hasMore,
      },
    });
  } catch (err) {
    console.error("GET /v1/search error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
