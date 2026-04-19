/**
 * Search & Discovery routes
 *
 * GET /v1/search — unified search across modules and lessons (powered by Algolia)
 */
const express = require("express");
const { searchAll } = require("../services/algolia");

const router = express.Router();

/**
 * GET /v1/search
 *
 * Query params: q (required), type=lesson|module, limit, cursor (page number)
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

    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const page = cursor ? parseInt(cursor, 10) || 0 : 0;

    const { results, pagination } = await searchAll(q, {
      type: type || undefined,
      page,
      hitsPerPage: pageSize,
    });

    return res.status(200).json({
      data: results,
      pagination: {
        limit: pagination.limit,
        nextCursor: pagination.nextCursor,
        hasMore: pagination.hasMore,
      },
    });
  } catch (err) {
    console.error("GET /v1/search error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
