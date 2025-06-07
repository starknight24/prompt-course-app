import { auth } from "../firebase";
import { logOut } from "../firebaseAuth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Welcome, {auth.currentUser?.email}</h2>
      <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Log Out</button>
    </div>
  );
}
