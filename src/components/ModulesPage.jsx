import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getModules } from "../api/catalog";
import { LevelBadge, TagBadge } from "./ui/Badge";
import LoadingSpinner from "./ui/LoadingSpinner";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import { FunnelIcon } from "@heroicons/react/24/outline";

const LEVELS = ["all", "beginner", "intermediate", "advanced"];

export default function ModulesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [level, setLevel] = useState(searchParams.get("level") || "all");
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const fetchModules = async (reset = false) => {
    setLoading(true);
    try {
      const params = { limit: 12 };
      if (level !== "all") params.level = level;
      if (query) params.q = query;
      if (!reset && cursor) params.cursor = cursor;

      const res = await getModules(params);
      const data = res.data || [];
      setModules((prev) => (reset ? data : [...prev, ...data]));
      setHasMore(res.pagination?.hasMore || false);
      setCursor(res.pagination?.nextCursor || null);
    } catch (err) {
      console.error("Failed to load modules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules(true);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Modules</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Explore structured learning paths organized by topic.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => handleFilter(l)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                level === l
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <FunnelIcon className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Module grid */}
      {loading && modules.length === 0 ? (
        <LoadingSpinner text="Loading modules..." />
      ) : modules.length === 0 ? (
        <EmptyState icon="📦" title="No modules found" description="Try adjusting your filters or search query." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <Link
              key={mod.id}
              to={`/modules/${mod.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600"
            >
              <div className="flex items-center justify-between">
                <LevelBadge level={mod.level} />
                {mod.lessonCount !== undefined && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {mod.lessonCount} lessons
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {mod.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {mod.description}
              </p>
              {mod.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {mod.tags.slice(0, 3).map((t) => (
                    <TagBadge key={t} tag={t} />
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <Pagination hasMore={hasMore} loading={loading} onLoadMore={() => fetchModules(false)} />
    </div>
  );
}
