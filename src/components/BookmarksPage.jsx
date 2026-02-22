import { Link } from "react-router-dom";
import { useProgress } from "../context/ProgressContext";
import { LevelBadge, StatusBadge, TagBadge } from "./ui/Badge";
import EmptyState from "./ui/EmptyState";
import LoadingSpinner from "./ui/LoadingSpinner";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function BookmarksPage() {
  const { bookmarkedLessons, toggleBookmark, getStatus, loading } = useProgress();

  const handleUnbookmark = async (lessonId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleBookmark(lessonId);
      toast.success("Bookmark removed");
    } catch {
      toast.error("Failed to remove bookmark");
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading bookmarks..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bookmarks</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Lessons you've saved for later — {bookmarkedLessons.length} bookmarked
        </p>
      </div>

      {bookmarkedLessons.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          message="Browse lessons and bookmark the ones you want to revisit later."
          actionLabel="Browse Lessons"
          actionTo="/lessons"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bookmarkedLessons.map((item) => {
            const status = getStatus(item.lessonId);
            return (
              <Link
                key={item.lessonId}
                to={`/lessons/${item.lessonId}`}
                className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <button
                  onClick={(e) => handleUnbookmark(item.lessonId, e)}
                  className="absolute right-3 top-3 rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Remove bookmark"
                >
                  <BookmarkSolid className="h-5 w-5 text-rose-500" />
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {item.level && <LevelBadge level={item.level} />}
                  {status && <StatusBadge status={status} />}
                </div>

                <h3 className="mt-2 pr-8 text-lg font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {item.title || item.lessonId}
                </h3>

                {item.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                )}

                {item.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.map((t) => <TagBadge key={t} tag={t} />)}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
