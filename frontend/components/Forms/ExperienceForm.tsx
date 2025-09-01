"use client";
import { useState, useEffect } from "react";
import { useProfile } from "@/context/profileProvider";
import { X, Plus, Briefcase, Building2, Calendar, FileText, Loader2, Trash2 } from "lucide-react";
import { convertDateForInput } from "@/lib/formateDate";

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
    startDate: convertDateForInput(initial?.startDate || ""),
    endDate: initial?.endDate ? convertDateForInput(initial.endDate) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when initial prop changes (for edit mode)
  useEffect(() => {
    setForm({
      title: initial?.title || "",
      company: initial?.company || "",
      responsibilities: initial?.responsibilities || [""],
      startDate: convertDateForInput(initial?.startDate || ""),
      endDate: initial?.endDate ? convertDateForInput(initial.endDate) : "",
    });
  }, [initial]);

  const addResponsibility = () => {
    setForm(f => ({ ...f, responsibilities: [...f.responsibilities, ""] }));
  };

  const removeResponsibility = (index: number) => {
    setForm(f => ({ 
      ...f, 
      responsibilities: f.responsibilities.filter((_, i) => i !== index) 
    }));
  };

  const updateResponsibility = (index: number, value: string) => {
    setForm(f => ({
      ...f,
      responsibilities: f.responsibilities.map((r, i) => i === index ? value : r)
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
      
      // Reset form and close
      setForm({
        title: "",
        company: "",
        responsibilities: [""],
        startDate: "",
        endDate: "",
      });
      
      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {editIndex !== undefined && editIndex !== null ? "Edit" : "Add"} Experience
            </h3>
            <p className="text-sm text-slate-500">Enter your work experience details</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-red-600" />
          </div>
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Briefcase className="inline w-4 h-4 mr-2" />
            Job Title *
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 placeholder-slate-500"
            placeholder="e.g., Senior Software Engineer"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        
        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Building2 className="inline w-4 h-4 mr-2" />
            Company *
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 placeholder-slate-500"
            placeholder="e.g., Google, Microsoft"
            value={form.company}
            onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            required
          />
        </div>
        
        {/* Responsibilities */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">
              <FileText className="inline w-4 h-4 mr-2" />
              Responsibilities *
            </label>
            <button
              type="button"
              onClick={addResponsibility}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-2 py-1 rounded-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {form.responsibilities.map((responsibility, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="flex-1">
                  <input
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 placeholder-slate-500"
                    placeholder={`Responsibility ${idx + 1} (e.g., Led development of key features)`}
                    value={responsibility}
                    onChange={e => updateResponsibility(idx, e.target.value)}
                    required
                  />
                </div>
                {form.responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResponsibility(idx)}
                    className="mt-3 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove responsibility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-slate-500 mt-2">
            Add at least one responsibility to describe your role and achievements
          </p>
        </div>
        
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Duration *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Start Date</label>
              <input
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900"
                type="month"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">End Date (Optional)</label>
              <input
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900"
                type="month"
                value={form.endDate || ""}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                placeholder="Leave empty if current"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Leave end date empty if you&apos;re currently working here
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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