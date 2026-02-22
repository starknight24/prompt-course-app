import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useProgress } from "../context/ProgressContext";
import { getStatsOverview } from "../api/progress";
import { getLessons } from "../api/catalog";
import { LevelBadge, StatusBadge } from "./ui/Badge";
import LoadingSpinner from "./ui/LoadingSpinner";
import { BookOpenIcon, BookmarkIcon, FireIcon, Square3Stack3DIcon, ArrowRightIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user, profile } = useUser();
  const { progressMap, bookmarkedLessons, summary } = useProgress();
  const [stats, setStats] = useState(null);
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, lessonsRes] = await Promise.all([getStatsOverview(), getLessons({ limit: 6 })]);
        setStats(statsRes);
        setRecentLessons(lessonsRes.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const statCards = [
    { label: "Total Modules", value: stats?.totalModules || 0, icon: Square3Stack3DIcon, color: "from-blue-500 to-blue-600" },
    { label: "Total Lessons", value: stats?.totalLessons || 0, icon: BookOpenIcon, color: "from-indigo-500 to-indigo-600" },
    { label: "Completed", value: stats?.userCompleted || 0, icon: CheckCircleIcon, color: "from-emerald-500 to-emerald-600" },
    { label: "In Progress", value: stats?.userInProgress || 0, icon: ClockIcon, color: "from-amber-500 to-amber-600" },
    { label: "Bookmarks", value: stats?.userBookmarks || 0, icon: BookmarkIcon, color: "from-rose-500 to-rose-600" },
    { label: "Streak", value: (stats?.streakDays || 0) + "d", icon: FireIcon, color: "from-orange-500 to-orange-600" },
  ];

  const inProgressLessons = Object.values(progressMap).filter((p) => p.status === "in_progress").slice(0, 4);
  const completedLessons = Object.values(progressMap).filter((p) => p.status === "completed").slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl">
        <p className="text-sm font-medium text-blue-100">{getGreeting()}, {profile?.displayName || user?.email?.split("@")[0] || "Learner"}</p>
        <h1 className="mt-2 text-2xl font-bold lg:text-3xl">Let&apos;s build sharper prompts today.</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100/90">Continue your journey with curated lessons and hands-on tasks.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/lessons" className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/30">Browse Lessons <ArrowRightIcon className="h-4 w-4" /></Link>
          <Link to="/modules" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20">View Modules</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className={"inline-flex rounded-lg bg-gradient-to-br p-2 text-white " + s.color}><s.icon className="h-5 w-5" /></div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">In Progress</h2>
            <Link to="/lessons" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">View all</Link>
          </div>
          {inProgressLessons.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
              <ClockIcon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No lessons in progress yet.</p>
            </div>
          ) : (
            <div className="space-y-3">{inProgressLessons.map((p) => (
              <Link key={p.lessonId} to={"/lessons/" + p.lessonId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div><p className="text-sm font-medium text-slate-900 dark:text-white">{p.lessonId}</p><StatusBadge status="in_progress" /></div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{p.percent || 0}%</span>
              </Link>
            ))}</div>
          )}
        </section>

        <section>
          <div className="mb-4"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recently Completed</h2></div>
          {completedLessons.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
              <CheckCircleIcon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Complete your first lesson to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">{completedLessons.map((p) => (
              <Link key={p.lessonId} to={"/lessons/" + p.lessonId} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div><p className="text-sm font-medium text-slate-900 dark:text-white">{p.lessonId}</p><StatusBadge status="completed" /></div>
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              </Link>
            ))}</div>
          )}
        </section>
      </div>

      {bookmarkedLessons.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white"><BookmarkIcon className="mr-2 inline h-5 w-5 text-rose-500" />Bookmarked</h2>
            <Link to="/bookmarks" className="text-sm font-medium text-blue-600 dark:text-blue-400">View all</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bookmarkedLessons.slice(0, 4).map((p) => (
              <Link key={p.lessonId} to={"/lessons/" + p.lessonId} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-rose-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <BookmarkIcon className="h-5 w-5 text-rose-500" />
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{p.lessonId}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Lessons</h2>
          <Link to="/lessons" className="text-sm font-medium text-blue-600 dark:text-blue-400">View all</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentLessons.map((lesson) => (
            <Link key={lesson.id} to={"/lessons/" + lesson.id} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600">
              <div className="flex items-center justify-between">
                <LevelBadge level={lesson.level} />
                {progressMap[lesson.id] && <StatusBadge status={progressMap[lesson.id].status} />}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{lesson.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{lesson.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                {lesson.duration && <span>{"⏱ " + lesson.duration}</span>}
                {lesson.topic && <span>{"· " + lesson.topic}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
