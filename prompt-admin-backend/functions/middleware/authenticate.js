/**
 * Firebase ID-token authentication middleware.
 *
 * Extracts the Bearer token from the Authorization header, verifies it with
 * Firebase Admin Auth, and attaches the decoded token to `req.user`.
 *
 * Usage:
 *   app.get("/v1/auth/me", authenticate, handler);
 */
const admin = require("firebase-admin");

async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  const idToken = header.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // uid, email, etc.
    return next();
  } catch (err) {
    console.error("Auth verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = authenticate;
