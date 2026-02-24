/**
 * Admin API — protected routes
 */
import apiRequest from "./client";

/* ── Module CRUD ─────────────────────────────────── */

export const createModule = (data) =>
  apiRequest("/admin/modules", { method: "POST", body: data });

export const updateModule = (moduleId, data) =>
  apiRequest(`/admin/modules/${moduleId}`, { method: "PUT", body: data });

export const deleteModule = (moduleId) =>
  apiRequest(`/admin/modules/${moduleId}`, { method: "DELETE" });

/* ── Lesson CRUD ─────────────────────────────────── */

export const createLesson = (data) =>
  apiRequest("/admin/lessons", { method: "POST", body: data });

export const updateLesson = (lessonId, data) =>
  apiRequest(`/admin/lessons/${lessonId}`, { method: "PUT", body: data });

export const deleteLesson = (lessonId) =>
  apiRequest(`/admin/lessons/${lessonId}`, { method: "DELETE" });

/* ── Question CRUD ───────────────────────────────── */

export const createQuestion = (lessonId, data) =>
  apiRequest(`/admin/lessons/${lessonId}/questions`, {
    method: "POST",
    body: data,
  });

export const updateQuestion = (questionId, data) =>
  apiRequest(`/admin/questions/${questionId}`, { method: "PUT", body: data });

export const deleteQuestion = (questionId) =>
  apiRequest(`/admin/questions/${questionId}`, { method: "DELETE" });

/* ── Publish ─────────────────────────────────────── */

export const publishLesson = (lessonId, published) =>
  apiRequest("/admin/publish-lesson", {
    method: "POST",
    body: { lessonId, published },
  });

/* ── Bulk import ─────────────────────────────────── */

export const bulkImport = ({ collection, data }) =>
  apiRequest("/admin/bulk-import", {
    method: "POST",
    body: { collection, data },
  });

/* ── Analytics ───────────────────────────────────── */

export const getEngagementAnalytics = () =>
  apiRequest("/admin/analytics/engagement");
