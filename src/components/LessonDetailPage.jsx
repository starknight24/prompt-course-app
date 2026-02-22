import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getLesson } from "../api/catalog";
import { submitResponse } from "../api/practice";
import { useProgress } from "../context/ProgressContext";
import { LevelBadge, TagBadge } from "./ui/Badge";
import LoadingSpinner from "./ui/LoadingSpinner";
import { ArrowLeftIcon, BookmarkIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";

export default function LessonDetailPage() {
  const { lessonId } = useParams();
  const { isBookmarked, toggleBookmark, saveProgress } = useProgress();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLesson(lessonId);
        setLesson(data);
        // Mark as in-progress
        try { await saveProgress(lessonId, "in_progress", 0); } catch {}
      } catch (err) {
        console.error("Lesson load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (question) => {
    const answer = answers[question.id];
    if (!answer) {
      toast.error("Please provide an answer");
      return;
    }
    setSubmitting((prev) => ({ ...prev, [question.id]: true }));
    try {
      const res = await submitResponse({
        lessonId,
        questionId: question.id,
        answer,
      });
      setResults((prev) => ({ ...prev, [question.id]: res }));
      if (res.result === "correct") {
        toast.success("Correct! 🎉");
      } else if (res.result === "partial") {
        toast("Partially correct!", { icon: "🤔" });
      } else {
        toast.error("Incorrect. Try again!");
      }
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const handleBookmark = async () => {
    try {
      await toggleBookmark(lessonId);
      toast.success(isBookmarked(lessonId) ? "Bookmark removed" : "Bookmarked!");
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  const handleMarkComplete = async () => {
    try {
      await saveProgress(lessonId, "completed", 100);
      toast.success("Lesson marked as completed! 🎉");
    } catch {
      toast.error("Failed to save progress");
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading lesson..." />;
  if (!lesson) return <div className="py-12 text-center text-slate-500">Lesson not found.</div>;

  const bookmarked = isBookmarked(lessonId);
  const questions = lesson.questions || [];

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link to="/lessons" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400">
        <ArrowLeftIcon className="h-4 w-4" /> Back to Lessons
      </Link>

      {/* Lesson header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={lesson.level} />
            {lesson.tags?.map((t) => <TagBadge key={t} tag={t} />)}
          </div>
          <button onClick={handleBookmark} className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            {bookmarked ? <BookmarkSolid className="h-6 w-6 text-rose-500" /> : <BookmarkIcon className="h-6 w-6 text-slate-400" />}
          </button>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{lesson.title}</h1>
        {lesson.description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{lesson.description}</p>}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          {lesson.duration && <span>⏱ {lesson.duration}</span>}
          {lesson.topic && <span>Topic: {lesson.topic}</span>}
        </div>
      </div>

      {/* Lesson content */}
      {lesson.content && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div
            className="prose prose-slate max-w-none dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Practice Questions</h2>
          {questions.map((q, i) => {
            const result = results[q.id];
            const isSubmitting = submitting[q.id];
            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-6 ${
                  result?.result === "correct"
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                    : result?.result === "incorrect"
                    ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Question {i + 1} · {q.type === "mcq" ? "Multiple Choice" : q.type === "short" ? "Short Answer" : "Code"}
                </p>
                <p className="mt-2 text-base font-medium text-slate-900 dark:text-white">{q.prompt}</p>

                {/* MCQ */}
                {q.type === "mcq" && q.choices && (
                  <div className="mt-4 space-y-2">
                    {q.choices.map((choice) => (
                      <label
                        key={choice.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                          answers[q.id] === choice.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={choice.id}
                          checked={answers[q.id] === choice.id}
                          onChange={() => handleAnswer(q.id, choice.id)}
                          disabled={!!result}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>{choice.id}.</strong> {choice.text}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Short answer */}
                {q.type === "short" && (
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Type your answer..."
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      disabled={!!result}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}

                {/* Code answer */}
                {q.type === "code" && (
                  <div className="mt-4">
                    <textarea
                      rows={6}
                      placeholder="Write your code here..."
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      disabled={!!result}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}

                {/* Submit / Result */}
                <div className="mt-4 flex items-center gap-4">
                  {!result && (
                    <button
                      onClick={() => handleSubmit(q)}
                      disabled={isSubmitting || !answers[q.id]}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Answer"}
                    </button>
                  )}

                  {result && (
                    <div className="flex items-center gap-2">
                      {result.result === "correct" ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`text-sm font-medium capitalize ${
                        result.result === "correct" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                      }`}>
                        {result.result} — Score: {result.score}
                      </span>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {result?.explanation && (
                  <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <strong>Explanation:</strong> {result.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mark as complete */}
      <div className="flex justify-center py-4">
        <button
          onClick={handleMarkComplete}
          className="rounded-lg bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
        >
          ✓ Mark Lesson as Complete
        </button>
      </div>
    </div>
  );
}
