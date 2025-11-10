"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/profileProvider";
import { Award, Loader2, X } from "lucide-react";
import DatePicker from "@/components/Ui/DatePicker";
import { convertDateForInput } from "@/lib/formateDate";

interface AwardHonorFormProps {
  initial?: {
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  };
  onClose?: () => void;
  editIndex?: number | null;
}

export default function AwardHonorForm({ initial, onClose, editIndex }: AwardHonorFormProps) {
  const { addAwardHonor, updateAwardHonor } = useProfile();
  const [form, setForm] = useState({
    title: initial?.title || "",
    issuer: initial?.issuer || "",
    date: initial?.date ? convertDateForInput(initial.date) : "",
    description: initial?.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      title: initial?.title || "",
      issuer: initial?.issuer || "",
      date: initial?.date ? convertDateForInput(initial.date) : "",
      description: initial?.description || "",
    });
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title) {
      setError("Award title is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        issuer: form.issuer || undefined,
        date: form.date || undefined,
        description: form.description || undefined,
      };

      if (editIndex !== undefined && editIndex !== null) {
        await updateAwardHonor(editIndex, payload);
      } else {
        await addAwardHonor(payload);
      }

      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save award.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-amber-600" />
                    </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editIndex !== undefined && editIndex !== null ? "Edit Award or Honor" : "Add Award or Honor"}
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
              placeholder="e.g., Employee of the Year"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="Organization or institution"
              value={form.issuer}
              onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))}
            />
          </div>
        </div>

        <DatePicker
          label="Date Received"
          value={form.date}
          onChange={value => setForm(f => ({ ...f, date: value }))}
          placeholder="Select date"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            placeholder="Optional summary of the award or accomplishment"
            rows={4}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
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
              <span>{editIndex !== undefined && editIndex !== null ? "Update" : "Add"} Award</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

