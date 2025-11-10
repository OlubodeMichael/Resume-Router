"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/profileProvider";
import { User, Loader2, X } from "lucide-react";

interface ReferenceFormProps {
  initial?: {
    name: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
    relation?: string;
  };
  onClose?: () => void;
  editIndex?: number | null;
}

export default function ReferenceForm({ initial, onClose, editIndex }: ReferenceFormProps) {
  const { addReference, updateReference } = useProfile();
  const [form, setForm] = useState({
    name: initial?.name || "",
    title: initial?.title || "",
    company: initial?.company || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    relation: initial?.relation || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      name: initial?.name || "",
      title: initial?.title || "",
      company: initial?.company || "",
      email: initial?.email || "",
      phone: initial?.phone || "",
      relation: initial?.relation || "",
    });
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name) {
      setError("Reference name is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        title: form.title || undefined,
        company: form.company || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        relation: form.relation || undefined,
      };

      if (editIndex !== undefined && editIndex !== null) {
        await updateReference(editIndex, payload);
      } else {
        await addReference(payload);
      }

      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reference.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-sky-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editIndex !== undefined && editIndex !== null ? "Edit Reference" : "Add Reference"}
            </h2>
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

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., Jane Doe"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., Former Manager"
              value={form.relation}
              onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., Senior Engineering Manager"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., Tech Corp"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="jane@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="+1 (555) 123-4567"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{editIndex !== undefined && editIndex !== null ? "Update" : "Add"} Reference</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

