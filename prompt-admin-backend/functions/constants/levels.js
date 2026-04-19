/**
 * Canonical level definitions used across the backend.
 *
 * LEVEL_ORDER  – sorting weight for beginner → intermediate → advanced
 * VALID_LEVELS – accepted level strings for validation
 */

const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

const VALID_LEVELS = ["beginner", "intermediate", "advanced"];

module.exports = { LEVEL_ORDER, VALID_LEVELS };
