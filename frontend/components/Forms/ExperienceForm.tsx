"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
import { X } from "lucide-react";

interface ExperienceFormProps {
  initial?: {
    title: string;
    company: string;
    responsibilities: string[];
    startDate: string;
    endDate?: string | null;
  };
  onClose?: () => void;
  editIndex?: number | null;
}

export default function ExperienceForm({ initial, onClose, editIndex }: ExperienceFormProps) {
  const { postExperience, updateExperience } = useProfile();
  const [form, setForm] = useState({
    title: initial?.title || "",
    company: initial?.company || "",
    responsibilities: initial?.responsibilities || [""],
    startDate: initial?.startDate || "",
    endDate: initial?.endDate || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResponsibilityChange = (idx: number, value: string) => {
    setForm(f => ({
      ...f,
      responsibilities: f.responsibilities.map((r, i) => (i === idx ? value : r)),
    }));
  };

  const addResponsibility = () => {
    setForm(f => ({
      ...f,
      responsibilities: [...f.responsibilities, ""],
    }));
  };

  const removeResponsibility = (idx: number) => {
    setForm(f => ({
      ...f,
      responsibilities: f.responsibilities.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        responsibilities: form.responsibilities.filter(r => r.trim() !== ""),
      };
      if (!payload.title || !payload.company || !payload.startDate || payload.responsibilities.length === 0) {
        setError("Please fill all required fields and add at least one responsibility.");
        setLoading(false);
        return;
      }
      if (editIndex !== undefined && editIndex !== null) {
        await updateExperience(editIndex, payload);
      } else {
        await postExperience(payload);
      }
      if (onClose) onClose();
      setForm({
        title: "",
        company: "",
        responsibilities: [""],
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col gap-6 border border-blue-100">
      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-2">
        {editIndex !== undefined && editIndex !== null ? "Edit" : "Add"} Experience
      </h2>
      {error && <div className="text-red-500 text-center font-medium">{error}</div>}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <input
          className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition p-3 rounded-lg text-gray-800 text-base placeholder-gray-400 outline-none"
          placeholder="Job Title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
        <input
          className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition p-3 rounded-lg text-gray-800 text-base placeholder-gray-400 outline-none"
          placeholder="Company"
          value={form.company}
          onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
          required
        />
        <div>
          <label className="block font-semibold mb-2 text-gray-700">Responsibilities</label>
          <div className="flex flex-col gap-2">
            {form.responsibilities.map((r, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition p-3 rounded-lg text-gray-800 text-base placeholder-gray-400 outline-none flex-1"
                  placeholder={`Responsibility #${idx + 1}`}
                  value={r}
                  onChange={e => handleResponsibilityChange(idx, e.target.value)}
                  required
                />
                {form.responsibilities.length > 1 && (
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-lg font-bold transition"
                    onClick={() => removeResponsibility(idx)}
                    tabIndex={-1}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition shadow-sm border border-blue-100"
            onClick={addResponsibility}
          >
            + Add Responsibility
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-1">Start Date</label>
            <input
              className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition p-3 rounded-lg text-gray-800 text-base placeholder-gray-400 outline-none w-full"
              type="date"
              placeholder="Start Date"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-1">End Date</label>
            <input
              className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition p-3 rounded-lg text-gray-800 text-base placeholder-gray-400 outline-none w-full"
              type="date"
              placeholder="End Date"
              value={form.endDate || ""}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-2">
          {onClose && (
            <button type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition" onClick={onClose}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}