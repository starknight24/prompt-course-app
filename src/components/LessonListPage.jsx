import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getLessons } from "../api/catalog";
import { useProgress } from "../context/ProgressContext";
import { LevelBadge, StatusBadge, TagBadge } from "./ui/Badge";
import LoadingSpinner from "./ui/LoadingSpinner";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { BookmarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const LEVELS = ["all", "beginner", "intermediate", "advanced"];

export default function LessonListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getStatus, isBookmarked, toggleBookmark } = useProgress();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [level, setLevel] = useState(searchParams.get("level") || "all");
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const fetchLessons = async (reset = false) => {
    setLoading(true);
    try {
      const params = { limit: 12 };
      if (level !== "all") params.level = level;
      if (query) params.q = query;
      if (!reset && cursor) params.cursor = cursor;

      const res = await getLessons(params);
      const data = res.data || [];
      setLessons((prev) => (reset ? data : [...prev, ...data]));
      setHasMore(res.pagination?.hasMore || false);
      setCursor(res.pagination?.nextCursor || null);
    } catch (err) {
      console.error("Failed to load lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons(true);
  }, [level, query]);

  const handleFilter = (newLevel) => {
    setLevel(newLevel);
    const params = {};
    if (newLevel !== "all") params.level = newLevel;
    if (query) params.q = query;
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (level !== "all") params.level = level;
    if (query) params.q = query;
    setSearchParams(params);
  };

  const handleBookmark = async (e, lessonId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleBookmark(lessonId);
      toast.success(isBookmarked(lessonId) ? "Bookmark removed" : "Bookmarked!");
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lessons</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse all available lessons.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => handleFilter(l)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                level === l
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search lessons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <FunnelIcon className="h-4 w-4" />
          </button>
        </form>
      </div>

      {loading && lessons.length === 0 ? (
        <LoadingSpinner text="Loading lessons..." />
      ) : lessons.length === 0 ? (
        <EmptyState icon="📝" title="No lessons found" description="Try adjusting your filters." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const status = getStatus(lesson.id);
            const bookmarked = isBookmarked(lesson.id);
            return (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.id}`}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600"
              >
                <button
                  onClick={(e) => handleBookmark(e, lesson.id)}
                  className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {bookmarked ? (
                    <BookmarkSolid className="h-5 w-5 text-rose-500" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <LevelBadge level={lesson.level} />
                  {status && <StatusBadge status={status} />}
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {lesson.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{lesson.description}</p>
                {lesson.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {lesson.tags.slice(0, 3).map((t) => <TagBadge key={t} tag={t} />)}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  {lesson.duration && <span>⏱ {lesson.duration}</span>}
                  {lesson.topic && <span>· {lesson.topic}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination hasMore={hasMore} loading={loading} onLoadMore={() => fetchLessons(false)} />
    </div>
  );
}
