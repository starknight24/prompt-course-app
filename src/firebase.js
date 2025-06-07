import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVl9j_Z2L8aoHPB3LKhoY5r3YAA1PFU6k",
  authDomain: "prompt-engineering-course.firebaseapp.com",
  projectId: "prompt-engineering-course",
  storageBucket: "prompt-engineering-course.appspot.com",
  messagingSenderId: "867680250236",
  appId: "1:867680250236:web:97526c15b58482abe2dcf9",
  measurementId: "G-B10ZEPBXP3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
