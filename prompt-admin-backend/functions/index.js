/**
 * Prompt Course App — Cloud Functions API
 *
 * All routes are served under the /v1 prefix.
 *
 * Route modules:
 *   /v1/auth/*                — Auth & Profile
 *   /v1/modules, /v1/lessons  — Catalog (public read)
 *   /v1/submit-response, etc  — Practice / Responses
 *   /v1/save-progress, etc    — Progress & Gamification
 *   /v1/search                — Search & Discovery
 *   /v1/report                — Feedback & Support
 *   /v1/admin/*               — Admin (protected)
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// ── Initialise Firebase Admin (only once) ──
admin.initializeApp();

// ── Express app setup ──
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "5mb" }));

// ── Health check (no prefix) ──
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Route modules ──
const authRoutes = require("./routes/auth");
const catalogRoutes = require("./routes/catalog");
const practiceRoutes = require("./routes/practice");
const progressRoutes = require("./routes/progress");
const searchRoutes = require("./routes/search");
const feedbackRoutes = require("./routes/feedback");
const adminRoutes = require("./routes/admin");

// Auth & Profile
app.use("/v1/auth", authRoutes);

// Catalog (modules + lessons)
app.use("/v1", catalogRoutes);

// Practice / Responses
app.use("/v1", practiceRoutes);

// Progress & Gamification
app.use("/v1", progressRoutes);

// Search & Discovery
app.use("/v1", searchRoutes);

// Feedback & Support
app.use("/v1", feedbackRoutes);

// Admin (protected)
app.use("/v1/admin", adminRoutes);

// ── 404 catch-all ──
app.all("*", (req, res) => {
  console.log("🔥 Route not found:", req.method, req.originalUrl);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// ── Export as Firebase HTTPS function ──
exports.api = functions.https.onRequest(app);
