import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getLesson } from "../../api/catalog";
import { createQuestion, updateQuestion, deleteQuestion } from "../../api/admin";
import LoadingSpinner from "../ui/LoadingSpinner";
import Modal from "../ui/Modal";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const EMPTY = { type: "mcq", prompt: "", choices: "", answerKey: "", explanation: "" };

export default function AdminQuestions() {
  const [params, setParams] = useSearchParams();
  const [lessonId, setLessonId] = useState(params.get("lessonId") || "");
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!lessonId.trim()) return;
    setLoading(true);
    try {
      const data = await getLesson(lessonId.trim());
      setLesson(data);
    } catch (err) {
      toast.error("Failed to load lesson");
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  const handleLookup = () => {
    if (lessonId.trim()) {
      setParams({ lessonId: lessonId.trim() });
      load();
    }
  };

  useEffect(() => {
    if (params.get("lessonId")) load();
  }, []);

  const questions = lesson?.questions || [];

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (q) => {
    setEditing(q.id);
    setForm({
      type: q.type || "mcq",
      prompt: q.prompt || "",
      choices: q.type === "mcq" && q.choices ? q.choices.map((c) => `${c.id}. ${c.text}`).join("\n") : "",
      answerKey: q.answerKey || "",
      explanation: q.explanation || "",
    });
    setShowForm(true);
  };

  const parseChoices = (raw) => {
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^([A-Za-z0-9]+)\.\s*(.+)/);
        return match ? { id: match[1].trim(), text: match[2].trim() } : null;
      })
      .filter(Boolean);
  };

  const handleSave = async () => {
    if (!form.prompt.trim()) { toast.error("Prompt is required"); return; }
    setSaving(true);
    const payload = {
      type: form.type,
      prompt: form.prompt.trim(),
      answerKey: form.answerKey.trim(),
      explanation: form.explanation.trim(),
    };
    if (form.type === "mcq") {
      payload.choices = parseChoices(form.choices);
    }
    try {
      if (editing) {
        await updateQuestion(lesson.id, editing, payload);
        toast.success("Question updated");
      } else {
        await createQuestion(lesson.id, payload);
        toast.success("Question created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q) => {
    if (!confirm(`Delete this question?`)) return;
    try {
      await deleteQuestion(lesson.id, q.id);
      toast.success("Question deleted");
      load();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Questions</h1>

      {/* Lesson lookup */}
      <div className="flex gap-2">
        <input
          type="text"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          placeholder="Enter Lesson ID..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
        />
        <button onClick={handleLookup} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Load
        </button>
      </div>

      {loading && <LoadingSpinner size="md" text="Loading lesson..." />}

      {lesson && !loading && (
        <>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{lesson.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {lesson.id} · {questions.length} questions</p>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Questions</h2>
            <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700">
              <PlusIcon className="h-4 w-4" /> Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <p className="text-sm text-slate-400">No questions yet. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="mr-2 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">{q.type}</span>
                      <span className="text-xs text-slate-400">Q{i + 1}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(q)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800">
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(q)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-900 dark:text-white">{q.prompt}</p>
                  {q.choices && (
                    <div className="mt-2 space-y-1">
                      {q.choices.map((c) => (
                        <p key={c.id} className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>{c.id}.</strong> {c.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Question" : "New Question"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="mcq">Multiple Choice</option>
              <option value="short">Short Answer</option>
              <option value="code">Code</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Prompt *</label>
            <textarea rows={3} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          {form.type === "mcq" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Choices (one per line: "A. text")</label>
              <textarea rows={4} value={form.choices} onChange={(e) => setForm({ ...form, choices: e.target.value })} placeholder={"A. First choice\nB. Second choice\nC. Third choice"} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Answer Key</label>
            <input value={form.answerKey} onChange={(e) => setForm({ ...form, answerKey: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Explanation</label>
            <textarea rows={2} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
