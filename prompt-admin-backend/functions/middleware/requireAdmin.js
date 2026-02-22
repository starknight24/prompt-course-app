/**
 * Admin authorization middleware.
 *
 * Must run AFTER `authenticate`. Looks up the user document in Firestore
 * and checks the `role` field equals "admin".
 */
const admin = require("firebase-admin");

async function requireAdmin(req, res, next) {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(req.user.uid).get();

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ error: "Forbidden — admin access required." });
    }

    req.userDoc = userDoc.data();
    return next();
  } catch (err) {
    console.error("Admin check failed:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = requireAdmin;
