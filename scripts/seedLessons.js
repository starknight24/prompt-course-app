// scripts/seedLessons.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVl9j_Z2L8aoHPB3LKhoY5r3YAA1PFU6k",
  authDomain: "prompt-engineering-course.firebaseapp.com",
  projectId: "prompt-engineering-course",
  storageBucket: "prompt-engineering-course.firebasestorage.app",
  messagingSenderId: "867680250236",
  appId: "1:867680250236:web:97526c15b58482abe2dcf9",
  measurementId: "G-B10ZEPBXP3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seed = async () => {
  const lessonRef = doc(collection(db, "lessons"));
  await setDoc(lessonRef, {
    title: "Intro to Prompting",
    description: "Learn basic prompting principles",
    content: "Prompting is how you give instructions to an AI...",
    order: 1,
    createdAt: new Date()
  });

  const task1 = doc(collection(db, `lessons/${lessonRef.id}/tasks`));
  await setDoc(task1, {
    type: "mcq",
    question: "Which prompt is clearer?",
    options: ["Write a blog", "Write a 300-word blog post on climate change"],
    correct_answer: 1,
    explanation: "Specific instructions lead to better output"
  });

  console.log("Lesson + task added ✅");
};

seed();
