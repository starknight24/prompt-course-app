import { useState } from "react";
import toast from "react-hot-toast";
import { bulkImport } from "../../api/admin";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const COLLECTIONS = ["modules", "lessons", "questions"];

export default function BulkImportPage() {
  const [collection, setCollection] = useState("lessons");
  const [json, setJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleImport = async () => {
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      toast.error("Invalid JSON — please check your input");
      return;
    }

    if (!Array.isArray(parsed)) {
      toast.error("JSON must be an array of documents");
      return;
    }

    setImporting(true);
    setResult(null);
    try {
      const res = await bulkImport({ collection, data: parsed });
      setResult(res);
      toast.success(`Successfully imported ${res.count ?? parsed.length} ${collection}`);
    } catch (err) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const loadFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setJson(reader.result);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bulk Import</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Import JSON data into Firestore collections</p>
      </div>

      {/* Collection selector */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Target Collection</label>
        <div className="flex gap-2">
          {COLLECTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setCollection(c)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                collection === c
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* File upload */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Upload JSON File</label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-600 dark:hover:bg-slate-800/80">
          <ArrowUpTrayIcon className="h-6 w-6 text-slate-400" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Click to upload or drag a .json file</span>
          <input type="file" accept=".json" onChange={loadFile} className="hidden" />
        </label>
      </div>

      {/* JSON editor */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">JSON Data (array of objects)</label>
        <textarea
          rows={16}
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder={'[\n  {\n    "title": "Example",\n    "description": "..."\n  }\n]'}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={importing || !json.trim()}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
      >
        {importing ? "Importing..." : `Import into ${collection}`}
      </button>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          <strong>Import complete!</strong> {result.count ?? "—"} documents imported into <code>{collection}</code>.
          {result.errors?.length > 0 && (
            <div className="mt-2 text-red-600 dark:text-red-400">
              {result.errors.length} errors: {result.errors.slice(0, 3).join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
