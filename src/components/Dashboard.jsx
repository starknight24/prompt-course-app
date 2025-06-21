import { auth } from "../firebase";
import { logOut } from "../firebaseAuth";
import { useNavigate } from "react-router-dom";
import useLessons from "../hooks/useLessons";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { lessons, loading } = useLessons();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  const getUserInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Prompt Engineering Course</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-slate-300 text-sm">
              {getGreeting()}, {auth.currentUser?.email?.split('@')[0]}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar with Profile */}
        <aside className="w-80 bg-slate-800/30 backdrop-blur-sm border-r border-slate-700/50 min-h-screen p-6">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {getUserInitials(auth.currentUser?.email)}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {auth.currentUser?.email?.split('@')[0] || "User"}
                  </h3>
                  <p className="text-slate-400 text-sm">{auth.currentUser?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Progress</span>
                  <span className="text-blue-400 text-sm font-medium">
                    {lessons.length} Lessons
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-1/3"></div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h4 className="text-slate-300 font-medium">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Total Lessons</span>
                  <span className="text-white font-medium">{lessons.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Completed</span>
                  <span className="text-green-400 font-medium">0</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400 text-sm">In Progress</span>
                  <span className="text-blue-400 font-medium">1</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {getGreeting()}, {auth.currentUser?.email?.split('@')[0]}!
              </h2>
              <p className="text-slate-400">
                Continue your prompt engineering journey with these lessons
              </p>
            </div>

            {/* Lessons Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-2">📚</span>
                  Available Lessons
                </h3>
                <div className="text-slate-400 text-sm">
                  {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} available
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-slate-400">Loading lessons...</span>
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-slate-500 text-lg mb-2">No lessons available yet</div>
                  <p className="text-slate-400">Check back soon for new content!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons.map((lesson, index) => (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${lesson.id}`}
                      className="group block"
                    >
                      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            {index + 1}
                          </div>
                          <div className="text-slate-500 text-sm">
                            Lesson {lesson.order || index + 1}
                          </div>
                        </div>
                        
                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                          {lesson.title}
                        </h4>
                        
                        <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                          {lesson.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-slate-500 text-xs">Available</span>
                          </div>
                          <div className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                            Start Lesson →
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
