/**
 * Feedback / Support API
 */
import apiRequest from "./client";

/** POST /v1/report */
export const submitReport = ({ type, message, context }) =>
  apiRequest("/report", {
    method: "POST",
    body: { type, message, context },
  });
