/**
 * Practice / Response API
 */
import apiRequest from "./client";

/** POST /v1/submit-response */
export const submitResponse = ({ lessonId, questionId, answer, timeMs }) =>
  apiRequest("/submit-response", {
    method: "POST",
    body: { lessonId, questionId, answer, timeMs },
  });

/** POST /v1/llm-feedback */
export const getLLMFeedback = ({ lessonId, questionId, answer, mode }) =>
  apiRequest("/llm-feedback", {
    method: "POST",
    body: { lessonId, questionId, answer, mode },
  });
