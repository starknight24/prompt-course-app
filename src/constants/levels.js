/**
 * Canonical level definitions used across the frontend.
 *
 * LEVEL_ORDER  – sorting weight for beginner → intermediate → advanced
 * LEVELS       – filter options (with "all" prefix) used in list pages
 * VALID_LEVELS – the raw level strings accepted by the API
 */

export const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

export const VALID_LEVELS = ["beginner", "intermediate", "advanced"];

export const LEVELS = ["all", ...VALID_LEVELS];
