/**
 * Roadmap API
 */
import apiRequest from "./client";

/** GET /v1/roadmap — ordered modules with lesson counts and user progress merged */
export const getRoadmap = () => apiRequest("/roadmap");
