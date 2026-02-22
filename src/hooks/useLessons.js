import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function useLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const lessonsRef = collection(db, "lessons");
        const q = query(lessonsRef, orderBy("number")); // ✅ sorting applied here
        const snapshot = await getDocs(q);              // ✅ using the query here

        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLessons(results);
      } catch (err) {
        console.error("❌ Failed to load lessons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  return { lessons, loading };
}
