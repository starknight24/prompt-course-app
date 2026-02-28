/**
 * Roadmap route
 *
 * GET /v1/roadmap
 *
 * Returns all modules ordered by level (beginner → intermediate → advanced),
 * then by createdAt. Each module includes its lessons (id + title only, no
 * heavy content) so the frontend can compute per-module progress from the
 * user's existing progressMap without an extra round-trip.
 *
 * No authentication required — progress overlay is applied client-side
 * using the data already loaded in ProgressContext.
 *
 * Sample response:
 * {
 *   "modules": [
 *     {
 *       "id": "mod1",
 *       "title": "Intro to Prompting",
 *       "description": "...",
 *       "level": "beginner",
 *       "tags": ["fundamentals"],
 *       "lessons": [
 *         { "id": "les1", "title": "Prompt Foundations" },
 *         { "id": "les2", "title": "Zero-shot Prompting" }
 *       ]
 *     }
 *   ]
 * }
 */
const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

router.get("/roadmap", async (_req, res) => {
  try {
    // Fetch all modules (no pagination — roadmap shows everything)
    const modulesSnap = await db
      .collection("modules")
      .orderBy("createdAt", "asc")
      .get();

    if (modulesSnap.empty) {
      return res.status(200).json({ modules: [] });
    }

    // For each module fetch its published lessons (lightweight — id + title only)
    const moduleList = await Promise.all(
      modulesSnap.docs.map(async (moduleDoc) => {
        const moduleData = moduleDoc.data();

        const lessonsSnap = await db
          .collection("lessons")
          .where("moduleId", "==", moduleDoc.id)
          .where("published", "==", true)
          .orderBy("createdAt", "asc")
          .get();

        const lessons = lessonsSnap.docs.map((d) => ({
          id: d.id,
          title: d.data().title || "",
        }));

        return {
          id: moduleDoc.id,
          title: moduleData.title || "",
          description: moduleData.description || "",
          level: moduleData.level || "beginner",
          tags: moduleData.tags || [],
          lessons,
        };
      }),
    );

    // Sort: beginner → intermediate → advanced, stable within same level
    moduleList.sort((a, b) => {
      const la = LEVEL_ORDER[a.level] ?? 99;
      const lb = LEVEL_ORDER[b.level] ?? 99;
      return la - lb;
    });

    return res.status(200).json({ modules: moduleList });
  } catch (err) {
    console.error("GET /v1/roadmap error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
