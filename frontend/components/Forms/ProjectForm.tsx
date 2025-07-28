"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
import { X, Plus, Minus } from "lucide-react";

interface ProjectFormProps {
  initial?: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate: string;
    endDate?: string | null;
  };
  onClose?: () => void;
  editIndex?: number | null;
}

export default function ProjectForm({ initial, onClose, editIndex }: ProjectFormProps) {
  const { postProject, updateProject } = useProfile();
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    technologies: initial?.technologies || [""],
    url: initial?.url || "",
    startDate: initial?.startDate || "",
    endDate: initial?.endDate || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTechnology = () => {
    setForm(f => ({ ...f, technologies: [...f.technologies, ""] }));
  };

  const removeTechnology = (index: number) => {
    setForm(f => ({ 
      ...f, 
      technologies: f.technologies.filter((_, i) => i !== index) 
    }));
  };

  const updateTechnology = (index: number, value: string) => {
    setForm(f => ({
      ...f,
      technologies: f.technologies.map((t, i) => i === index ? value : t)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        technologies: form.technologies.filter(t => t.trim() !== ""),
      };
      
      if (!payload.name || !payload.description || !payload.startDate || payload.technologies.length === 0) {
        setError("Please fill all required fields and add at least one technology.");
        setLoading(false);
        return;
      }

      if (editIndex !== undefined && editIndex !== null) {
        await updateProject(editIndex, payload);
      } else {
        await postProject(payload);
      }
      
      if (onClose) onClose();
      setForm({
        name: "",
        description: "",
        technologies: [""],
        url: "",
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
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          {editIndex !== undefined && editIndex !== null ? "Edit" : "Add"} Project
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
          placeholder="Project Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        
        <textarea
          className="w-full px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition rounded text-sm text-gray-700 placeholder-gray-500 resize-none"
          placeholder="Project Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          required
        />
        
        <input
          className="w-full px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition rounded text-sm text-gray-700 placeholder-gray-500"
          placeholder="Project URL (optional)"
          value={form.url}
          onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
        />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Technologies</label>
            <button
              type="button"
              onClick={addTechnology}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          {form.technologies.map((technology, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition rounded text-sm text-gray-700 placeholder-gray-500"
                placeholder={`Technology ${idx + 1}`}
                value={technology}
                onChange={e => updateTechnology(idx, e.target.value)}
                required
              />
              {form.technologies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTechnology(idx)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Minus className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition rounded text-sm text-gray-700 placeholder-gray-500"
            type="month"
            placeholder="Start Date"
            value={form.startDate}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            required
          />
          <input
            className="flex-1 px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition rounded text-sm text-gray-700 placeholder-gray-500"
            type="month"
            placeholder="End Date"
            value={form.endDate || ""}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>
        
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