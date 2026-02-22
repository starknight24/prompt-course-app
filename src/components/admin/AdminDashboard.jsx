import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEngagementAnalytics } from "../../api/admin";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  UsersIcon,
  BookOpenIcon,
  RectangleStackIcon,
  ClipboardDocumentCheckIcon,
  ArrowUpIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEngagementAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading analytics..." />;

  const stats = [
    { label: "Total Users", value: analytics?.totalUsers ?? "—", icon: UsersIcon, color: "blue" },
    { label: "Total Modules", value: analytics?.totalModules ?? "—", icon: RectangleStackIcon, color: "purple" },
    { label: "Total Lessons", value: analytics?.totalLessons ?? "—", icon: BookOpenIcon, color: "emerald" },
    { label: "Total Submissions", value: analytics?.totalSubmissions ?? "—", icon: ClipboardDocumentCheckIcon, color: "amber" },
    { label: "Active This Week", value: analytics?.activeThisWeek ?? "—", icon: ArrowUpIcon, color: "teal" },
    { label: "Avg Completion", value: analytics?.avgCompletion ? `${Math.round(analytics.avgCompletion)}%` : "—", icon: ChartBarIcon, color: "rose" },
  ];

  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Platform overview and engagement analytics</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${colorMap[s.color]}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/admin/modules", label: "Manage Modules", desc: "Create and edit modules" },
          { to: "/admin/lessons", label: "Manage Lessons", desc: "Create and edit lessons" },
          { to: "/admin/questions", label: "Manage Questions", desc: "Add practice questions" },
          { to: "/admin/import", label: "Bulk Import", desc: "Import JSON data" },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md hover:border-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{link.label}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Top lessons */}
      {analytics?.topLessons?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Top Lessons by Submissions</h2>
          <div className="space-y-3">
            {analytics.topLessons.map((l, i) => (
              <div key={l.id || i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{l.title || l.id}</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">{l.submissions ?? l.count} submissions</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
