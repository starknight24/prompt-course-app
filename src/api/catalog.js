/**
 * Catalog API — Modules & Lessons (public read)
 */
import apiRequest from "./client";

/* ── Modules ─────────────────────────────────────── */

/** GET /v1/modules */
export const getModules = (params = {}) =>
  apiRequest("/modules", { params });

/** GET /v1/modules/:moduleId */
export const getModule = (moduleId) =>
  apiRequest(`/modules/${moduleId}`);

/** GET /v1/modules/:moduleId/lessons */
export const getModuleLessons = (moduleId, params = {}) =>
  apiRequest(`/modules/${moduleId}/lessons`, { params });

/* ── Lessons ─────────────────────────────────────── */

/** GET /v1/lessons */
export const getLessons = (params = {}) =>
  apiRequest("/lessons", { params });

/** GET /v1/lessons/:lessonId  (full content + questions) */
export const getLesson = (lessonId) =>
  apiRequest(`/lessons/${lessonId}`);
