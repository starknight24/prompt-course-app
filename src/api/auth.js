/**
 * Auth / Profile API
 */
import apiRequest from "./client";

/** GET /v1/auth/me */
export const getMe = () => apiRequest("/auth/me");

/** GET /v1/admin/check */
export const checkAdmin = () => apiRequest("/admin/check");
