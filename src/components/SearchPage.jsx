import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { search } from "../api/search";
import { LevelBadge, TagBadge } from "./ui/Badge";
import LoadingSpinner from "./ui/LoadingSpinner";
import EmptyState from "./ui/EmptyState";
import Pagination from "./ui/Pagination";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "lesson", label: "Lessons" },
  { value: "module", label: "Modules" },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [activeType, setActiveType] = useState(params.get("type") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (reset = true) => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const data = await search({
        q,
        type: activeType || undefined,
        limit: 20,
        cursor: reset ? undefined : cursor,
      });
      const items = data.results || data.items || data || [];
      setResults(reset ? items : [...results, ...items]);
      setCursor(data.nextCursor || null);
      setHasMore(!!data.nextCursor);
      setSearched(true);
      if (reset) {
        setParams({ q, ...(activeType ? { type: activeType } : {}) });
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run search on mount if query param exists
  useEffect(() => {
    if (params.get("q")) doSearch(true);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") doSearch(true);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setTimeout(() => doSearch(true), 0);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Search</h1>

      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search lessons, modules, topics..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <button
          onClick={() => doSearch(true)}
          disabled={!query.trim()}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTypeChange(tab.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              activeType === tab.value
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && results.length === 0 ? (
        <LoadingSpinner size="lg" text="Searching..." />
      ) : results.length === 0 && searched ? (
        <EmptyState title="No results found" message={`Nothing matched "${params.get("q")}". Try different keywords.`} />
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((item, idx) => (
            <Link
              key={item.id || idx}
              to={item.type === "module" ? `/modules/${item.id}` : `/lessons/${item.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700"
            >
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium uppercase ${
                  item.type === "module"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  {item.type || "lesson"}
                </span>
                {item.level && <LevelBadge level={item.level} />}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
              )}
              {item.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((t) => <TagBadge key={t} tag={t} />)}
                </div>
              )}
            </Link>
          ))}
          <Pagination loading={loading} hasMore={hasMore} onLoadMore={() => doSearch(false)} />
        </div>
      ) : null}
    </div>
  );
}
