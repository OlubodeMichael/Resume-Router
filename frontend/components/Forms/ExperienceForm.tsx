"use client";
import { useState, useEffect } from "react";
import { useProfile } from "@/context/profileProvider";
import { X, Plus, Briefcase, Loader2, Trash2 } from "lucide-react";
import { convertDateForInput } from "@/lib/formateDate";

interface ExperienceFormProps {
  initial?: {
    title: string;
    company: string;
    location?: string;
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
    location: initial?.location || "",
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
      location: initial?.location || "",
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
        location: "",
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
    <div className="bg-white rounded-lg border border-gray-200 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editIndex !== undefined && editIndex !== null ? "Edit Experience" : "Add Experience"}
              </h2>
            </div>
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
      
      {/* Form Content */}
      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
            <X className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Title and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Title *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 placeholder-gray-400"
                placeholder="e.g., Senior Software Engineer"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Company *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 placeholder-gray-400"
                placeholder="e.g., Google, Microsoft"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location (Optional)
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., San Francisco, CA or Remote"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter city, state format (e.g., &quot;New York, NY&quot;) or &quot;Remote&quot;
            </p>
          </div>
        
          {/* Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
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
            
            <div className="space-y-2">
              {form.responsibilities.map((responsibility, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <div className="flex-1">
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 placeholder-gray-400"
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
                      className="mt-2 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Remove responsibility"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              Add at least one responsibility to describe your role and achievements
            </p>
          </div>
        
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
                type="month"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
                type="month"
                value={form.endDate || ""}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                placeholder="Leave empty if current"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave end date empty if you&apos;re currently working here
          </p>
        
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
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
    </div>
  );
}