import { auth } from "../firebase";
import { logOut } from "../firebaseAuth";
import { useNavigate } from "react-router-dom";
import useLessons from "../hooks/useLessons";
import { Link } from "react-router-dom";


export default function Dashboard() {
  const navigate = useNavigate();
  const { lessons, loading } = useLessons(); // ✅ fetch lessons from Firestore

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">Welcome, {auth.currentUser?.email}</h2>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded mb-6"
      >
        Log Out
      </button>

      <h3 className="text-lg font-semibold mb-2">📚 Your Lessons</h3>

      {loading ? (
        <p>Loading lessons...</p>
      ) : (
        <ul className="space-y-4">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="border p-4 rounded shadow">
              <Link to={`/lesson/${lesson.id}`}>
                <h4 className="text-lg font-bold hover:underline">{lesson.title}</h4>
              </Link>
              <p className="text-sm text-gray-600">{lesson.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
