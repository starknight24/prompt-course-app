const LEVEL_STYLES = {
  beginner: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  advanced: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  not_started: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function LevelBadge({ level }) {
  if (!level) return null;
  const l = level.toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${LEVEL_STYLES[l] || LEVEL_STYLES.beginner}`}
    >
      {l}
    </span>
  );
}

export function StatusBadge({ status }) {
  if (!status) return null;
  const labels = {
    completed: "Completed",
    in_progress: "In Progress",
    not_started: "Not Started",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.not_started}`}
    >
      {labels[status] || status}
    </span>
  );
}

export function TagBadge({ tag }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
      {tag}
    </span>
  );
}
