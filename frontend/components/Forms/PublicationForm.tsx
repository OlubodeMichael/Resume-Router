"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/profileProvider";
import { BookOpen, Loader2, X } from "lucide-react";
import DatePicker from "@/components/Ui/DatePicker";
import { convertDateForInput } from "@/lib/formateDate";

interface PublicationFormProps {
  initial?: {
    title: string;
    venue?: string;
    date?: string;
    url?: string;
    summary?: string;
  };
  onClose?: () => void;
  editIndex?: number | null;
}

export default function PublicationForm({ initial, onClose, editIndex }: PublicationFormProps) {
  const { addPublication, updatePublication } = useProfile();
  const [form, setForm] = useState({
    title: initial?.title || "",
    venue: initial?.venue || "",
    date: initial?.date ? convertDateForInput(initial.date) : "",
    url: initial?.url || "",
    summary: initial?.summary || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      title: initial?.title || "",
      venue: initial?.venue || "",
      date: initial?.date ? convertDateForInput(initial.date) : "",
      url: initial?.url || "",
      summary: initial?.summary || "",
    });
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title) {
      setError("Publication title is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        venue: form.venue || undefined,
        date: form.date || undefined,
        url: form.url || undefined,
        summary: form.summary || undefined,
      };

      if (editIndex !== undefined && editIndex !== null) {
        await updatePublication(editIndex, payload);
      } else {
        await addPublication(payload);
      }

      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save publication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editIndex !== undefined && editIndex !== null ? "Edit Publication" : "Add Publication"}
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., Machine Learning in Web Development"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., IEEE Software Journal"
              value={form.venue}
              onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
            />
          </div>
        </div>

        <DatePicker
          label="Publication Date"
          value={form.date}
          onChange={value => setForm(f => ({ ...f, date: value }))}
          placeholder="Select publication date"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            placeholder="https://"
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            placeholder="Optional summary or abstract"
            rows={4}
            value={form.summary}
            onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{editIndex !== undefined && editIndex !== null ? "Update" : "Add"} Publication</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

