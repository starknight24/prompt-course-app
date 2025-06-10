// src/hooks/useLessons.js
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function useLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      const snapshot = await getDocs(collection(db, "lessons"));
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLessons(results);
      setLoading(false);
    };

    fetchLessons();
  }, []);

  return { lessons, loading };
}
