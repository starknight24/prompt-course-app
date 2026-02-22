/**
 * Reusable pagination controls.
 */
export default function Pagination({ hasMore, loading, onLoadMore }) {
  if (!hasMore) return null;
  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        {loading ? "Loading…" : "Load More"}
      </button>
    </div>
  );
}
