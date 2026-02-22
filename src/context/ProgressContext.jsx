/**
 * Progress & Bookmarks context.
 *
 * Loads all user-progress once, provides helpers for
 * checking lesson status, toggling bookmarks, etc.
 */
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useUser } from "./UserContext";
import { getUserProgress, toggleBookmark as apiToggleBookmark, saveProgress as apiSaveProgress } from "../api/progress";

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export function ProgressProvider({ children }) {
  const { user } = useUser();
  const [progressMap, setProgressMap] = useState({});   // lessonId -> progress obj
  const [summary, setSummary] = useState({ completed: 0, inProgress: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getUserProgress();
      const map = {};
      (res.data || []).forEach((p) => {
        map[p.lessonId] = p;
      });
      setProgressMap(map);
      setSummary(res.summary || { completed: 0, inProgress: 0, total: 0 });
    } catch {
      // silently fail — user may not have progress yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getStatus = (lessonId) => progressMap[lessonId]?.status || null;
  const isBookmarked = (lessonId) => !!progressMap[lessonId]?.bookmarked;

  const toggleBookmark = async (lessonId) => {
    const current = isBookmarked(lessonId);
    // Optimistic update
    setProgressMap((prev) => ({
      ...prev,
      [lessonId]: { ...prev[lessonId], lessonId, bookmarked: !current },
    }));
    try {
      await apiToggleBookmark(lessonId, !current);
    } catch {
      // Revert on failure
      setProgressMap((prev) => ({
        ...prev,
        [lessonId]: { ...prev[lessonId], bookmarked: current },
      }));
      throw new Error("Failed to update bookmark");
    }
  };

  const saveProgress = async (lessonId, status, percent) => {
    await apiSaveProgress({ lessonId, status, percent });
    await refresh();
  };

  const bookmarkedLessons = Object.values(progressMap).filter((p) => p.bookmarked);

  return (
    <ProgressContext.Provider
      value={{
        progressMap,
        summary,
        loading,
        getStatus,
        isBookmarked,
        toggleBookmark,
        saveProgress,
        refresh,
        bookmarkedLessons,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
