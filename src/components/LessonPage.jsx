import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";

export default function LessonPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonSnap = await getDoc(lessonRef);
      const taskSnap = await getDocs(collection(lessonRef, "tasks"));

      if (lessonSnap.exists()) {
        setLesson(lessonSnap.data());
        const taskList = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(taskList);
      }
      setLoading(false);
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) return <p>Loading lesson...</p>;
  if (!lesson) return <p>Lesson not found</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      <p className="text-gray-700">{lesson.content}</p>

      <h2 className="text-xl mt-6 font-semibold">🧠 Tasks</h2>
      <ul className="space-y-4">
        {tasks.map(task => (
          <li key={task.id} className="border p-4 rounded">
            <p className="font-medium">{task.question}</p>
            {task.options?.map((option, idx) => (
              <button
                key={idx}
                className="block mt-2 border p-2 rounded hover:bg-blue-100"
                onClick={() => alert(idx === task.correct_answer ? "✅ Correct!" : "❌ Try Again")}
              >
                {option}
              </button>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
