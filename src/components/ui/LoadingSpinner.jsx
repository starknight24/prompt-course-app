export default function LoadingSpinner({ size = "md", text = "" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-10 w-10 border-2",
    lg: "h-14 w-14 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizes[size]}`}
      />
      {text && (
        <p className="text-sm text-slate-400 dark:text-slate-500">{text}</p>
      )}
    </div>
  );
}
