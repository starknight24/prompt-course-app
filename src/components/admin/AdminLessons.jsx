import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getLessons } from "../../api/catalog";
import { createLesson, updateLesson, deleteLesson, publishLesson } from "../../api/admin";
import LoadingSpinner from "../ui/LoadingSpinner";
import Modal from "../ui/Modal";
import { PlusIcon, PencilSquareIcon, TrashIcon, GlobeAltIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const EMPTY = { title: "", description: "", moduleId: "", level: "beginner", tags: "", order: 0, content: "" };

export default function AdminLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState({});

  const load = useCallback(async () => {
    try {
      const data = await getLessons();
      setLessons(data.lessons || data || []);
    } catch (err) {
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (lesson) => {
    setEditing(lesson.id);
    setForm({
      title: lesson.title || "",
      description: lesson.description || "",
      moduleId: lesson.moduleId || "",
      level: lesson.level || "beginner",
      tags: (lesson.tags || []).join(", "),
      order: lesson.order ?? 0,
      content: lesson.content || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      moduleId: form.moduleId.trim() || undefined,
      level: form.level,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      order: Number(form.order) || 0,
      content: form.content,
    };
    try {
      if (editing) {
        await updateLesson(editing, payload);
        toast.success("Lesson updated");
      } else {
        await createLesson(payload);
        toast.success("Lesson created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lesson) => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    try {
      await deleteLesson(lesson.id);
      toast.success("Lesson deleted");
      load();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handlePublish = async (lesson) => {
    setPublishing((prev) => ({ ...prev, [lesson.id]: true }));
    try {
      const newState = !lesson.published;
      await publishLesson(lesson.id, newState);
      toast.success(newState ? "Lesson published" : "Lesson unpublished");
      load();
    } catch (err) {
      toast.error(err.message || "Publish failed");
    } finally {
      setPublishing((prev) => ({ ...prev, [lesson.id]: false }));
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading lessons..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Lessons</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lessons.length} lessons total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700">
          <PlusIcon className="h-4 w-4" /> New Lesson
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Level</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Module</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Published</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{lesson.title}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm capitalize text-slate-600 dark:text-slate-300">{lesson.level}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{lesson.moduleId || "—"}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handlePublish(lesson)}
                    disabled={publishing[lesson.id]}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      lesson.published
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {lesson.published ? <><GlobeAltIcon className="h-3 w-3" /> Live</> : <><EyeSlashIcon className="h-3 w-3" /> Draft</>}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button onClick={() => openEdit(lesson)} className="mr-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(lesson)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Lesson" : "New Lesson"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Module ID</label>
              <input value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Content (HTML)</label>
            <textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
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
