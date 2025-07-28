"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
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
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          {editIndex !== undefined && editIndex !== null ? "Edit" : "Add"} Skill
        </h3>
        {onClose && (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition rounded text-sm text-gray-700 placeholder-gray-500"
          placeholder="Skill Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 rounded hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : (editIndex !== undefined && editIndex !== null ? "Update" : "Add")}
          </button>
        </div>
      </form>
    </div>
  );
}