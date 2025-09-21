"use client";
import { useState, useEffect } from "react";
import { useProfile } from "@/context/profileProvider";
import { X, FolderOpen, Loader2 } from "lucide-react";
import { convertDateForInput } from "@/lib/formateDate";

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
    technologies: initial?.technologies || [],
    url: initial?.url || "",
    startDate: convertDateForInput(initial?.startDate || ""),
    endDate: initial?.endDate ? convertDateForInput(initial.endDate) : "",
    newTechnology: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when initial prop changes (for edit mode)
  useEffect(() => {
    setForm({
      name: initial?.name || "",
      description: initial?.description || "",
      technologies: initial?.technologies || [],
      url: initial?.url || "",
      startDate: convertDateForInput(initial?.startDate || ""),
      endDate: initial?.endDate ? convertDateForInput(initial.endDate) : "",
      newTechnology: "",
    });
  }, [initial]);


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
      
      // Reset form and close
      setForm({
        name: "",
        description: "",
        technologies: [],
        url: "",
        startDate: "",
        endDate: "",
        newTechnology: "",
      });
      
      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editIndex !== undefined && editIndex !== null ? "Edit Project" : "Add Project"}
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
          {/* Project Name and URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project Name *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm  text-gray-900 placeholder-gray-400"
                placeholder="E-commerce Platform"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project URL
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm  text-gray-900 placeholder-gray-400"
                placeholder="https://github.com/username/project"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              />
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm resize-none text-gray-900 placeholder-gray-400"
              placeholder="Describe your project, its purpose, and key features..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              required
            />
          </div>
          
          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Technologies *
            </label>
            
            {/* Display existing technologies */}
            {form.technologies.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {form.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 border border-blue-200 text-blue-800"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newTechnologies = form.technologies.filter((_, i) => i !== index);
                          setForm(f => ({ ...f, technologies: newTechnologies }));
                        }}
                        className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add new technology input */}
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 placeholder-gray-400"
                placeholder="Type technology and press Enter (e.g., React, Node.js, MongoDB)"
                value={form.newTechnology}
                onChange={e => setForm(f => ({ ...f, newTechnology: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const trimmedTech = form.newTechnology.trim();
                    if (trimmedTech && !form.technologies.includes(trimmedTech)) {
                      setForm(f => ({ 
                        ...f, 
                        technologies: [...f.technologies, trimmedTech],
                        newTechnology: ""
                      }));
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                type="month"
                value={form.endDate || ""}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>
          
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
                <span>{editIndex !== undefined && editIndex !== null ? "Update" : "Add"} Project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}