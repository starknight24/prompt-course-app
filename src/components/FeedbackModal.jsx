import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "./ui/Modal";
import { submitReport } from "../api/feedback";

const TYPES = [
  { value: "bug", label: "🐛 Bug Report", desc: "Something is broken" },
  { value: "content", label: "📝 Content Issue", desc: "Incorrect or missing info" },
  { value: "feature", label: "💡 Feature Request", desc: "Suggest an improvement" },
];

export default function FeedbackModal({ open, onClose }) {
  const [type, setType] = useState("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await submitReport({ type, message: message.trim() });
      toast.success("Feedback submitted — thank you!");
      setMessage("");
      setType("bug");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Feedback" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type picker */}
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setType(t.value)}
              className={`rounded-xl border p-3 text-center text-sm transition ${
                type === t.value
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <span className="block text-lg">{t.label.split(" ")[0]}</span>
              <span className="block text-xs mt-1">{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Message */}
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the issue or suggestion…"
          required
          maxLength={5000}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Submit"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
