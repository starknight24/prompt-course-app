import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export default function LessonPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerState, setAnswerState] = useState({});

  useEffect(() => {
    const fetchLesson = async () => {
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonSnap = await getDoc(lessonRef);
      const taskSnap = await getDocs(collection(lessonRef, "tasks"));

      if (lessonSnap.exists()) {
        setLesson(lessonSnap.data());
        const taskList = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(taskList);
      }
      setLoading(false);
    };

    fetchLesson();
  }, [lessonId]);

  const handleAnswer = async (task, selectedIndex) => {
    const user = auth.currentUser;
    if (!user) return;
  
    const taskId = task.id;
    const correct = selectedIndex === task.correct_answer;

    setAnswerState((prev) => ({
      ...prev,
      [taskId]: {
        selectedIndex,
        status: correct ? "correct" : "incorrect",
        attempts: (prev[taskId]?.attempts || 0) + 1,
        syncing: true,
      },
    }));
  
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) {
      await setDoc(userRef, { taskHistory: {} });
    }
  
    const updatePath = `taskHistory.${taskId}`;
    try {
      const previousAttempts = userSnap.data()?.taskHistory?.[taskId]?.attempts || 0;
      await updateDoc(userRef, {
        [updatePath]: {
          correct,
          attempts: previousAttempts + 1,
        },
      });
      setAnswerState((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          syncing: false,
          error: null,
        },
      }));
    } catch (error) {
      setAnswerState((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          syncing: false,
          error: "Could not sync progress",
        },
      }));
    }
  };
  

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          <span className="text-sm text-slate-300/80">Loading lesson...</span>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-2xl shadow-blue-500/10">
          <p className="text-lg text-slate-200/80">Lesson not found.</p>
          <Link to="/dashboard" className="mt-4 inline-flex items-center space-x-2 text-sm text-blue-300 hover:text-blue-200">
            <span>←</span>
            <span>Back to dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
      <div className="absolute -top-32 right-0 h-96 w-96 translate-x-1/4 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[26rem] w-[26rem] -translate-x-1/4 translate-y-1/4 rounded-full bg-violet-500/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-10">
        <div className="mb-8 flex items-center justify-between text-sm text-slate-300/80">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200/80 transition-colors hover:border-cyan-300/60 hover:text-cyan-200">
            <span>←</span>
            <span>Back</span>
          </Link>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100/80">
            Lesson workspace
          </span>
        </div>

        <div className="grid flex-1 gap-8 lg:grid-cols-[1.25fr_1fr]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-100/70">
              {lesson.topic || "Core concept"}
            </span>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-white">
              {lesson.title}
            </h1>
            <p className="mt-3 text-sm text-slate-200/80">
              Estimated focus: {lesson.duration || "15 minutes"}
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-sm leading-relaxed text-slate-200/90 whitespace-pre-line">
              {lesson.content}
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
            <div>
              <h2 className="text-lg font-semibold text-white">🧠 Practice tasks</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
                Reinforce the lesson with quick checks
              </p>
            </div>
            <div className="space-y-5">
              {tasks.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300/80">
                  No practice tasks yet. Revisit soon for hands-on drills.
                </div>
              )}
              {tasks.map((task) => {
                const state = answerState[task.id];
                return (
                  <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/90 shadow-inner shadow-cyan-500/10">
                    <p className="text-base font-semibold text-white">{task.question}</p>
                    <div className="mt-4 space-y-2">
                      {task.options?.map((option, idx) => {
                        const isSelected = state?.selectedIndex === idx;
                        const isCorrect = state?.status === "correct" && isSelected;
                        const isIncorrect = state?.status === "incorrect" && isSelected;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAnswer(task, idx)}
                            className={`group relative flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                              isCorrect
                                ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                                : isIncorrect
                                ? "border-rose-400/60 bg-rose-500/10 text-rose-200"
                                : isSelected
                                ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
                                : "border-white/10 bg-slate-950/40 text-slate-200/90 hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:text-cyan-100"
                            }`}
                          >
                            <span>{option}</span>
                            <span className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
                              {isCorrect ? "Correct" : isIncorrect ? "Try again" : "Select"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {state && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300/70">
                        <span className={state.status === "correct" ? "text-emerald-300" : "text-rose-300"}>
                          {state.status === "correct" ? "Nice work!" : "Refine your approach and try again."}
                        </span>
                        <span>Attempts: {state.attempts}</span>
                        {state.syncing && <span className="text-cyan-200/80">Syncing...</span>}
                        {state.error && <span className="text-rose-300">{state.error}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
