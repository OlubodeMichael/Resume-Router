"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
import { X, GraduationCap, Calendar, Building2, BookOpen, Loader2, Award } from "lucide-react";
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
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {editIndex !== undefined && editIndex !== null ? "Edit" : "Add"} Education
            </h3>
            <p className="text-sm text-slate-500">Enter your educational background</p>
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
        {/* Institution */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Building2 className="inline w-4 h-4 mr-2" />
            Institution *
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 placeholder-slate-500"
            placeholder="e.g., Stanford University"
            value={form.school}
            onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
            required
          />
        </div>
        
        {/* Degree Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <GraduationCap className="inline w-4 h-4 mr-2" />
            Degree Type *
          </label>
          <select
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 bg-white"
            value={form.degree}
            onChange={e => setForm(f => ({ ...f, degree: e.target.value }))}
            required
          >
            <option value="" className="text-slate-500">Select your degree</option>
            <option value="High School Diploma" className="text-slate-700">High School Diploma</option>
            <option value="Associate&apos;s Degree" className="text-slate-700">Associate&apos;s Degree</option>
            <option value="Bachelor&apos;s Degree" className="text-slate-700">Bachelor&apos;s Degree</option>
            <option value="Master&apos;s Degree" className="text-slate-700">Master&apos;s Degree</option>
            <option value="Doctorate" className="text-slate-700">Doctorate</option>
            <option value="Certificate" className="text-slate-700">Certificate</option>
            <option value="Other" className="text-slate-700">Other</option>
          </select>
        </div>
        
        {/* Field of Study */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <BookOpen className="inline w-4 h-4 mr-2" />
            Field of Study *
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 placeholder-slate-500"
            placeholder="e.g., Computer Science, Business Administration"
            value={form.fieldOfStudy}
            onChange={e => setForm(f => ({ ...f, fieldOfStudy: e.target.value }))}
            required
          />
        </div>

        {/* GPA */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Award className="inline w-4 h-4 mr-2" />
            GPA (Optional)
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 placeholder-slate-500"
            placeholder="e.g., 3.8, 4.0, 3.5/4.0"
            value={form.gpa}
            onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))}
          />
          <p className="text-xs text-slate-500 mt-1">
            Include your GPA if it&apos;s 3.5 or higher, or if it&apos;s relevant to the position
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
            Leave end date empty if you&apos;re currently studying
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
              <span>{editIndex !== undefined && editIndex !== null ? "Update" : "Add"} Education</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}