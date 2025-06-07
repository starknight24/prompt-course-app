const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/admin/lessons", async (req, res) => {
  try {
    const { title, content, level, tags } = req.body;

    if (!title || !content) {
      return res.status(400).send("Missing title or content");
    }

    const docRef = await db.collection("lessons").add({
      title,
      content,
      level,
      tags,
      createdAt: new Date(),
    });

    res.status(201).send({ id: docRef.id, message: "Lesson created" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.all("*", (req, res) => {
    console.log("🔥 Unexpected request method:", req.method, req.path);
    res.status(404).send("Route not found");
  });

  exports.api = functions.https.onRequest(app);
