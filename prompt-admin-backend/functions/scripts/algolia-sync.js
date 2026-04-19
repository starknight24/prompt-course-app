#!/usr/bin/env node

/**
 * One-time Algolia Sync Script
 *
 * Reads all existing modules and lessons from Firestore and indexes them
 * into Algolia. Run manually when setting up Algolia for the first time
 * or to re-sync all data.
 *
 * Usage:
 *   cd prompt-admin-backend/functions
 *   node scripts/algolia-sync.js
 *
 * Requires .env file with:
 *   ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY
 *   FIREBASE_SERVICE_ACCOUNT_PATH (for local dev)
 */

const admin = require("firebase-admin");
const path = require("path");

// Load env vars
try {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
} catch (e) {
  // dotenv not installed
}

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (serviceAccountPath) {
  const serviceAccount = require(path.resolve(__dirname, "..", serviceAccountPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Use default credentials (e.g. GOOGLE_APPLICATION_CREDENTIALS)
  admin.initializeApp();
}

const db = admin.firestore();

// Import Algolia service (config picks up env vars via dotenv)
const { batchIndex, INDEX_MODULES, INDEX_LESSONS } = require("../services/algolia");

async function syncModules() {
  console.log("Fetching modules from Firestore...");
  const snap = await db.collection("modules").get();
  const records = [];

  snap.forEach((doc) => {
    const data = doc.data();
    const { createdAt, updatedAt, ...rest } = data;
    const record = {
      objectID: doc.id,
      type: "module",
      ...rest,
    };
    if (createdAt && typeof createdAt.toDate === "function") {
      record.createdAt = Math.floor(createdAt.toDate().getTime() / 1000);
    }
    records.push(record);
  });

  if (records.length === 0) {
    console.log("No modules found in Firestore.");
    return 0;
  }

  console.log(`Indexing ${records.length} modules into Algolia...`);
  await batchIndex(INDEX_MODULES, records);
  console.log(`Successfully indexed ${records.length} modules.`);
  return records.length;
}

async function syncLessons() {
  console.log("Fetching lessons from Firestore...");
  const snap = await db.collection("lessons").get();
  const records = [];

  snap.forEach((doc) => {
    const data = doc.data();
    const { content, createdAt, updatedAt, ...rest } = data;
    const record = {
      objectID: doc.id,
      type: "lesson",
      ...rest,
    };
    // Store truncated content snippet for search
    if (content) {
      record.contentSnippet = String(content).replace(/<[^>]+>/g, "").slice(0, 500);
    }
    if (createdAt && typeof createdAt.toDate === "function") {
      record.createdAt = Math.floor(createdAt.toDate().getTime() / 1000);
    }
    records.push(record);
  });

  if (records.length === 0) {
    console.log("No lessons found in Firestore.");
    return 0;
  }

  console.log(`Indexing ${records.length} lessons into Algolia...`);
  await batchIndex(INDEX_LESSONS, records);
  console.log(`Successfully indexed ${records.length} lessons.`);
  return records.length;
}

async function main() {
  console.log("=== Algolia Full Sync ===\n");

  try {
    const moduleCount = await syncModules();
    const lessonCount = await syncLessons();

    console.log(`\nSync complete: ${moduleCount} modules, ${lessonCount} lessons indexed.`);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }

  process.exit(0);
}

main();
