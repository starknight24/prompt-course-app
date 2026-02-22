import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getModule, getModuleLessons } from "../api/catalog";
import { useProgress } from "../context/ProgressContext";
import { LevelBadge, StatusBadge, TagBadge } from "./ui/Badge";
import LoadingSpinner from "./ui/LoadingSpinner";
import Pagination from "./ui/Pagination";
import { ArrowLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const { getStatus } = useProgress();
  const [mod, setMod] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [moduleRes, lessonsRes] = await Promise.all([
          getModule(moduleId),
          getModuleLessons(moduleId, { limit: 20 }),
        ]);
        setMod(moduleRes);
        setLessons(lessonsRes.data || []);
        setHasMore(lessonsRes.pagination?.hasMore || false);
        setCursor(lessonsRes.pagination?.nextCursor || null);
      } catch (err) {
        console.error("Module load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [moduleId]);

  const loadMore = async () => {
    if (!cursor) return;
    const res = await getModuleLessons(moduleId, { limit: 20, cursor });
    setLessons((prev) => [...prev, ...(res.data || [])]);
    setHasMore(res.pagination?.hasMore || false);
    setCursor(res.pagination?.nextCursor || null);
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading module..." />;
  if (!mod) return <div className="py-12 text-center text-slate-500">Module not found.</div>;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link to="/modules" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400">
        <ArrowLeftIcon className="h-4 w-4" /> Back to Modules
      </Link>

      {/* Module header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <LevelBadge level={mod.level} />
          {mod.tags?.map((t) => <TagBadge key={t} tag={t} />)}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{mod.title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{mod.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><BookOpenIcon className="h-4 w-4" />{mod.lessonCount || lessons.length} lessons</span>
        </div>
      </div>

      {/* Lessons list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Lessons</h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No lessons in this module yet.</p>
        ) : (
          lessons.map((lesson, i) => {
            const status = getStatus(lesson.id);
            return (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.id}`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                  {lesson.order || i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{lesson.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{lesson.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LevelBadge level={lesson.level} />
                  {status && <StatusBadge status={status} />}
                </div>
              </Link>
            );
          })
        )}
      </div>

      <Pagination hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
    </div>
  );
}
