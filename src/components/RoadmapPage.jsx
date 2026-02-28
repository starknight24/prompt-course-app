/**
 * RoadmapPage
 *
 * Displays all modules as a visual vertical roadmap.
 * Each node shows:
 *  - Module title, level badge, description
 *  - Lesson count
 *  - User completion progress (% and lessons done)
 *  - Locked state (module is locked until the previous one reaches 50%)
 *  - Link to the module detail page
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRoadmap } from "../api/roadmap";
import { useProgress } from "../context/ProgressContext";
import LoadingSpinner from "./ui/LoadingSpinner";
import { LevelBadge } from "./ui/Badge";
import {
  LockClosedIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

/* ── helpers ──────────────────────────────────────────────────────── */

const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

function computeModuleProgress(module, progressMap) {
  const lessons = module.lessons || [];
  if (lessons.length === 0) return { completed: 0, total: 0, pct: 0 };
  const completed = lessons.filter(
    (l) => progressMap[l.id]?.status === "completed"
  ).length;
  return {
    completed,
    total: lessons.length,
    pct: Math.round((completed / lessons.length) * 100),
  };
}

/* ── sub-components ───────────────────────────────────────────────── */

function ConnectorLine({ done }) {
  return (
    <div className="mx-auto w-0.5 h-10 transition-colors duration-500"
      style={{ background: done ? "rgb(99,102,241)" : "rgb(203,213,225)" }}
    />
  );
}

function ModuleNode({ module, index, locked, prog }) {
  const isComplete = prog.pct === 100;
  const isStarted = prog.completed > 0;

  const borderColor = locked
    ? "border-slate-200 dark:border-slate-700"
    : isComplete
    ? "border-indigo-400 dark:border-indigo-500"
    : isStarted
    ? "border-blue-400 dark:border-blue-500"
    : "border-slate-300 dark:border-slate-600";

  const bgColor = locked
    ? "bg-slate-50 dark:bg-slate-800/50"
    : "bg-white dark:bg-slate-800";

  return (
    <div className={`relative rounded-2xl border-2 ${borderColor} ${bgColor} shadow-sm transition-all duration-300 ${locked ? "opacity-60" : "hover:shadow-md"}`}>
      {/* Step number bubble */}
      <div className={`absolute -left-5 top-6 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm
        ${isComplete
          ? "border-indigo-400 bg-indigo-500 text-white dark:border-indigo-400"
          : locked
          ? "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
          : isStarted
          ? "border-blue-400 bg-blue-500 text-white"
          : "border-slate-300 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
        }`}>
        {isComplete ? (
          <CheckCircleSolid className="h-5 w-5" />
        ) : locked ? (
          <LockClosedIcon className="h-4 w-4" />
        ) : (
          index + 1
        )}
      </div>

      <div className="p-5 pl-6">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <LevelBadge level={module.level} />
              {isComplete && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <CheckCircleIcon className="h-3.5 w-3.5" /> Complete
                </span>
              )}
              {isStarted && !isComplete && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <PlayCircleIcon className="h-3.5 w-3.5" /> In Progress
                </span>
              )}
              {locked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  <LockClosedIcon className="h-3.5 w-3.5" /> Locked
                </span>
              )}
            </div>
            <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white truncate">
              {module.title}
            </h2>
          </div>

          {!locked && (
            <Link
              to={`/modules/${module.id}`}
              className="shrink-0 rounded-xl bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {isComplete ? "Review" : isStarted ? "Continue" : "Start"}
            </Link>
          )}
        </div>

        {/* Description */}
        {module.description && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {module.description}
          </p>
        )}

        {/* Tags */}
        {module.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {module.tags.map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {prog.total > 0 && !locked && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{prog.completed} / {prog.total} lessons</span>
              <span className="font-medium">{prog.pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isComplete
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{ width: `${prog.pct}%` }}
              />
            </div>
          </div>
        )}

        {prog.total === 0 && !locked && (
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 italic">
            No lessons yet
          </p>
        )}
      </div>
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────── */

export default function RoadmapPage() {
  const { progressMap } = useProgress();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getRoadmap()
      .then((res) => {
        // Sort by level order, then by createdAt within same level
        const sorted = (res.modules || []).sort((a, b) => {
          const la = LEVEL_ORDER[a.level] ?? 99;
          const lb = LEVEL_ORDER[b.level] ?? 99;
          return la !== lb ? la - lb : 0;
        });
        setModules(sorted);
      })
      .catch(() => setError("Failed to load roadmap. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  // Determine locked state: a module is locked if the previous module < 50%
  const progList = modules.map((m) => computeModuleProgress(m, progressMap));
  const isLocked = (i) => {
    if (i === 0) return false;
    return progList[i - 1].pct < 50;
  };

  const totalLessons = progList.reduce((s, p) => s + p.total, 0);
  const completedLessons = progList.reduce((s, p) => s + p.completed, 0);
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center rounded-2xl bg-indigo-50 p-3 dark:bg-indigo-900/30">
          <MapIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
          Learning Roadmap
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Complete each module in order to unlock the next.
        </p>

        {/* Overall progress */}
        {totalLessons > 0 && (
          <div className="mx-auto mt-5 max-w-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{completedLessons} / {totalLessons} total lessons</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{overallPct}% overall</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Roadmap path */}
      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-600">
          <MapIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            No modules found. Check back soon!
          </p>
        </div>
      ) : (
        <div className="relative pl-10">
          {modules.map((module, i) => (
            <div key={module.id}>
              <ModuleNode
                module={module}
                index={i}
                locked={isLocked(i)}
                prog={progList[i]}
              />
              {i < modules.length - 1 && (
                <ConnectorLine done={progList[i].pct >= 50} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
