"use client";
import { useState } from "react";
import { useProfile } from "@/hooks/profileProvider";
import { X } from "lucide-react";

interface SkillFormProps {
  initial?: {
    name: string;
  };
  onClose?: () => void;
  editIndex?: number | null;
}

export default function SkillForm({ initial, onClose, editIndex }: SkillFormProps) {
  const { postSkill, updateSkill } = useProfile();
  const [form, setForm] = useState({
    name: initial?.name || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!form.name.trim()) {
        setError("Please enter a skill name.");
        setLoading(false);
        return;
      }

      if (editIndex !== undefined && editIndex !== null) {
        await updateSkill(editIndex, form.name);
      } else {
        await postSkill(form.name);
      }
      
      if (onClose) onClose();
      setForm({ name: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {editIndex !== undefined && editIndex !== null ? "Edit" : "Add"} Skill
        </h3>
        {onClose && (
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 mb-2">
            Skill Name
          </label>
          <input
            id="skill-name"
            className="w-full px-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
            placeholder="e.g., React, Python, Project Management"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            disabled={loading}
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              editIndex !== undefined && editIndex !== null ? "Update Skill" : "Add Skill"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}