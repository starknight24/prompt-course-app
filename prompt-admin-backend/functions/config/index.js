/**
 * Centralized Configuration Module
 *
 * ⚠️  THIS IS THE ONLY FILE THAT SHOULD ACCESS process.env DIRECTLY
 *
 * All backend files should import configuration from this module.
 * Add new environment variables here and export them for use elsewhere.
 *
 * Environment variables are loaded from:
 * - .env file (local development)
 * - Firebase Functions environment (production)
 *
 * Usage:
 *   const config = require("../config");
 *   console.log(config.openai.apiKey);
 */

// Load .env file in local development
// Firebase Functions automatically handles env vars in production
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
  } catch (e) {
    // dotenv not installed, skip
  }
}

const config = {
  /**
   * Environment
   */
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",

  /**
   * OpenAI Configuration (for LLM feedback features)
   * Add your OpenAI API key to .env: OPENAI_API_KEY=sk-...
   */
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },

  /**
   * Firebase Admin SDK
   * Note: In Cloud Functions, credentials are auto-injected.
   * For local development with a service account:
   *   FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
   */
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "",
  },

  /**
   * Additional API Keys (add as needed)
   * Example:
   *   stripe: {
   *     secretKey: process.env.STRIPE_SECRET_KEY || "",
   *   },
   */
};

/**
 * Validate required configuration in production
 */
function validateConfig() {
  const errors = [];

  // Add validation for required keys when they become mandatory
  // Example:
  // if (config.isProduction && !config.openai.apiKey) {
  //   errors.push("OPENAI_API_KEY is required in production");
  // }

  if (errors.length > 0) {
    console.error("Configuration validation failed:");
    errors.forEach((e) => console.error(`  - ${e}`));
    // Optionally throw in production
    // if (config.isProduction) throw new Error("Invalid configuration");
  }
}

validateConfig();

module.exports = config;
