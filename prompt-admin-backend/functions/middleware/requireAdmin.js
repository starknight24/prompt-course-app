/**
 * Admin authorization middleware.
 *
 * Must run AFTER `authenticate`. Looks up the user document in Firestore
 * and checks the `role` field equals "admin".
 *
 * Results are cached in-memory for 5 minutes to reduce Firestore reads.
 */
const admin = require("firebase-admin");

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const adminCache = new Map();

function getCachedAdmin(uid) {
  const entry = adminCache.get(uid);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    adminCache.delete(uid);
    return undefined;
  }
  return entry.data;
}

function setCachedAdmin(uid, data) {
  adminCache.set(uid, { data, timestamp: Date.now() });
}

async function requireAdmin(req, res, next) {
  try {
    const uid = req.user.uid;

    // Check cache first
    const cached = getCachedAdmin(uid);
    if (cached !== undefined) {
      if (cached === null || cached.role !== "admin") {
        return res.status(403).json({ error: "Forbidden — admin access required." });
      }
      req.userDoc = cached;
      return next();
    }

    // Cache miss — read from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(uid).get();

    const userData = userDoc.exists ? userDoc.data() : null;
    setCachedAdmin(uid, userData);

    if (!userData || userData.role !== "admin") {
      return res.status(403).json({ error: "Forbidden — admin access required." });
    }

    req.userDoc = userData;
    return next();
  } catch (err) {
    console.error("Admin check failed:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = requireAdmin;
