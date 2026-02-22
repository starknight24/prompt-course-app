/**
 * Progress & Gamification API
 */
import apiRequest from "./client";

/** POST /v1/save-progress */
export const saveProgress = ({ lessonId, status, percent }) =>
  apiRequest("/save-progress", {
    method: "POST",
    body: { lessonId, status, percent },
  });

/** GET /v1/user-progress */
export const getUserProgress = () =>
  apiRequest("/user-progress");

/** GET /v1/stats/overview */
export const getStatsOverview = () =>
  apiRequest("/stats/overview");

/** PATCH /v1/lessons/:lessonId/bookmark */
export const toggleBookmark = (lessonId, bookmarked) =>
  apiRequest(`/lessons/${lessonId}/bookmark`, {
    method: "PATCH",
    body: { bookmarked },
  });
