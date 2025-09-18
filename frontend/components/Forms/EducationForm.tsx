"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
import { X, GraduationCap, Loader2 } from "lucide-react";
import { convertDateForInput } from "@/lib/formateDate";

interface EducationFormProps {
  initial?: {
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string | null;
    gpa?: string;
  };
  onClose?: () => void;
  editIndex?: number | null;
}



export default function EducationForm({ initial, onClose, editIndex }: EducationFormProps) {
  const { postEducation, updateEducation } = useProfile();
  const [form, setForm] = useState({
    school: initial?.school || "",
    degree: initial?.degree || "",
    fieldOfStudy: initial?.fieldOfStudy || "",
    startDate: convertDateForInput(initial?.startDate || ""),
    endDate: initial?.endDate ? convertDateForInput(initial.endDate) : "",
    gpa: initial?.gpa || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!form.school || !form.degree || !form.fieldOfStudy || !form.startDate) {
        setError("Please fill all required fields.");
        setLoading(false);
        return;
      }

      if (editIndex !== undefined && editIndex !== null) {
        await updateEducation(editIndex, form);
      } else {
        await postEducation(form);
      }
      
      if (onClose) onClose();
      setForm({
        school: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        gpa: "",
      });
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
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editIndex !== undefined && editIndex !== null ? "Edit Education" : "Add Education"}
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
          {/* Institution and Degree Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Institution *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 placeholder-gray-400"
                placeholder="e.g., Stanford University"
                value={form.school}
                onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Degree Type *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 bg-white"
                value={form.degree}
                onChange={e => setForm(f => ({ ...f, degree: e.target.value }))}
                required
              >
                <option value="" className="text-gray-500">Select your degree</option>
                <option value="High School Diploma" className="text-gray-700">High School Diploma</option>
                <option value="Associate&apos;s Degree" className="text-gray-700">Associate&apos;s Degree</option>
                <option value="Bachelor&apos;s Degree" className="text-gray-700">Bachelor&apos;s Degree</option>
                <option value="Master&apos;s Degree" className="text-gray-700">Master&apos;s Degree</option>
                <option value="Doctorate" className="text-gray-700">Doctorate</option>
                <option value="Certificate" className="text-gray-700">Certificate</option>
                <option value="Other" className="text-gray-700">Other</option>
              </select>
            </div>
          </div>
          
          {/* Field of Study and GPA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Field of Study *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 placeholder-gray-400"
                placeholder="e.g., Computer Science, Business Administration"
                value={form.fieldOfStudy}
                onChange={e => setForm(f => ({ ...f, fieldOfStudy: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                GPA (Optional)
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 placeholder-gray-400"
                placeholder="e.g., 3.8, 4.0, 3.5/4.0"
                value={form.gpa}
                onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))}
              />
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Include your GPA if it&apos;s 3.5 or higher, or if it&apos;s relevant to the position
          </p>
        
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date *
              </label>
              <input
                className="w-auto min-w-[140px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
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
                className="w-auto min-w-[140px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900"
                type="month"
                value={form.endDate || ""}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                placeholder="Leave empty if current"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Leave end date empty if you&apos;re currently studying
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
                <span>{editIndex !== undefined && editIndex !== null ? "Update" : "Add"} Education</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}