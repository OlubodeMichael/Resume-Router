"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/profileProvider";
import { HandHeart, Loader2, Plus, Trash2, X } from "lucide-react";
import DatePicker from "@/components/Ui/DatePicker";
import { convertDateForInput } from "@/lib/formateDate";

interface VolunteerFormProps {
  initial?: {
    org: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    impact?: string[];
    url?: string;
  };
  onClose?: () => void;
  editIndex?: number | null;
}

export default function VolunteerForm({ initial, onClose, editIndex }: VolunteerFormProps) {
  const { addVolunteer, updateVolunteer } = useProfile();
  const [form, setForm] = useState({
    org: initial?.org || "",
    role: initial?.role || "",
    startDate: initial?.startDate ? convertDateForInput(initial.startDate) : "",
    endDate: initial?.endDate ? convertDateForInput(initial.endDate) : "",
    impact: initial?.impact && initial.impact.length ? initial.impact : [""],
    url: initial?.url || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      org: initial?.org || "",
      role: initial?.role || "",
      startDate: initial?.startDate ? convertDateForInput(initial.startDate) : "",
      endDate: initial?.endDate ? convertDateForInput(initial.endDate) : "",
      impact: initial?.impact && initial.impact.length ? initial.impact : [""],
      url: initial?.url || "",
    });
  }, [initial]);

  const addImpact = () => {
    setForm(f => ({ ...f, impact: [...f.impact, ""] }));
  };

  const updateImpact = (index: number, value: string) => {
    setForm(f => ({
      ...f,
      impact: f.impact.map((item, idx) => (idx === index ? value : item)),
    }));
  };

  const removeImpact = (index: number) => {
    setForm(f => ({
      ...f,
      impact: f.impact.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.org) {
      setError("Organization name is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        org: form.org,
        role: form.role || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        impact: form.impact.filter(item => item.trim() !== ""),
        url: form.url || undefined,
      };

      if (editIndex !== undefined && editIndex !== null) {
        await updateVolunteer(editIndex, payload);
      } else {
        await addVolunteer(payload);
      }

      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save volunteer experience.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <HandHeart className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editIndex !== undefined && editIndex !== null ? "Edit Volunteer Experience" : "Add Volunteer Experience"}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., Code for Good"
              value={form.org}
              onChange={e => setForm(f => ({ ...f, org: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., Volunteer Developer"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            value={form.startDate}
            onChange={value => setForm(f => ({ ...f, startDate: value }))}
            placeholder="Select start date"
          />
          <DatePicker
            label="End Date"
            value={form.endDate}
            onChange={value => setForm(f => ({ ...f, endDate: value }))}
            placeholder="Select end date"
            minDate={form.startDate || undefined}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Impact</label>
          <div className="space-y-2">
            {form.impact.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                  placeholder={`Impact ${idx + 1} (e.g., Mentored 5 juniors)`}
                  value={item}
                  onChange={e => updateImpact(idx, e.target.value)}
                />
                {form.impact.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImpact(idx)}
                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                    title="Remove impact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImpact}
            className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Impact
          </button>
          <p className="text-xs text-gray-500 mt-1">Optional bullet points describing your contributions.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            placeholder="https://"
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
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
              <span>{editIndex !== undefined && editIndex !== null ? "Update" : "Add"} Experience</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

