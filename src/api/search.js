/**
 * Search API
 */
import apiRequest from "./client";

/** GET /v1/search */
export const search = (params = {}) =>
  apiRequest("/search", { params });
