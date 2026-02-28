import { NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useProgress } from "../../context/ProgressContext";
import {
  HomeIcon,
  Square3Stack3DIcon,
  BookOpenIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChartBarIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { to: "/roadmap", label: "Roadmap", icon: MapIcon },
  { to: "/modules", label: "Modules", icon: Square3Stack3DIcon },
  { to: "/lessons", label: "Lessons", icon: BookOpenIcon },
  { to: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
  { to: "/search", label: "Search", icon: MagnifyingGlassIcon },
];

const adminItems = [
  { to: "/admin", label: "Admin Panel", icon: Cog6ToothIcon },
  { to: "/admin/analytics", label: "Analytics", icon: ChartBarIcon },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useUser();
  const { summary } = useProgress();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button (mobile) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:hidden dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Menu
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Learning
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-slate-200 dark:border-slate-700" />
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Administration
              </p>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/admin"}
                  className={linkClass}
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Progress summary card */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your progress
            </p>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {summary.completed}
              </span>
              <span className="mb-0.5 text-sm text-slate-500 dark:text-slate-400">
                / {summary.total || "–"} lessons
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{
                  width: `${summary.total ? Math.round((summary.completed / summary.total) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {summary.inProgress} in progress
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
