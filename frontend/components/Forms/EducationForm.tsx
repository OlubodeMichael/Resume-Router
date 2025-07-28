"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
import { X } from "lucide-react";

interface EducationFormProps {
  initial?: {
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string | null;
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
    startDate: initial?.startDate || "",
    endDate: initial?.endDate || "",
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
          {editIndex !== undefined && editIndex !== null ? "Edit" : "Add"} Education
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
          placeholder="School/University"
          value={form.school}
          onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
          required
        />
        
        <select
          className="w-full px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition rounded text-sm text-gray-700"
          value={form.degree}
          onChange={e => setForm(f => ({ ...f, degree: e.target.value }))}
          required
        >
          <option value="" className="text-gray-500">Select Degree</option>
          <option value="High School Diploma" className="text-gray-700">High School Diploma</option>
          <option value="Associate&apos;s Degree" className="text-gray-700">Associate&apos;s Degree</option>
          <option value="Bachelor&apos;s Degree" className="text-gray-700">Bachelor&apos;s Degree</option>
          <option value="Master&apos;s Degree" className="text-gray-700">Master&apos;s Degree</option>
          <option value="Doctorate" className="text-gray-700">Doctorate</option>
          <option value="Certificate" className="text-gray-700">Certificate</option>
          <option value="Other" className="text-gray-700">Other</option>
        </select>
        
        <input
          className="w-full px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition rounded text-sm text-gray-700 placeholder-gray-500"
          placeholder="Field of Study"
          value={form.fieldOfStudy}
          onChange={e => setForm(f => ({ ...f, fieldOfStudy: e.target.value }))}
          required
        />
        
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