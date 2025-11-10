"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/profileProvider";
import { Award, Loader2, X } from "lucide-react";
import DatePicker from "@/components/Ui/DatePicker";
import { convertDateForInput } from "@/lib/formateDate";

interface CertificationFormProps {
  initial?: {
    name?: string;
    issuer?: string;
    date: string;
    expirationDate?: string;
    credentialId?: string;
    url?: string;
  };
  onClose?: () => void;
  editIndex?: number | null;
}

export default function CertificationForm({ initial, onClose, editIndex }: CertificationFormProps) {
  const { addCertification, updateCertification } = useProfile();
  const [form, setForm] = useState({
    name: initial?.name || "",
    issuer: initial?.issuer || "",
    date: convertDateForInput(initial?.date || ""),
    expirationDate: initial?.expirationDate ? convertDateForInput(initial.expirationDate) : "",
    credentialId: initial?.credentialId || "",
    url: initial?.url || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      name: initial?.name || "",
      issuer: initial?.issuer || "",
      date: convertDateForInput(initial?.date || ""),
      expirationDate: initial?.expirationDate ? convertDateForInput(initial.expirationDate) : "",
      credentialId: initial?.credentialId || "",
      url: initial?.url || "",
    });
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.date) {
      setError("Certification name and issue date are required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        issuer: form.issuer,
        date: form.date,
        expirationDate: form.expirationDate || undefined,
        credentialId: form.credentialId || undefined,
        url: form.url || undefined,
      };

      if (editIndex !== undefined && editIndex !== null) {
        await updateCertification(editIndex, payload);
      } else {
        await addCertification(payload);
      }

      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save certification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editIndex !== undefined && editIndex !== null ? "Edit Certification" : "Add Certification"}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., AWS Certified Solutions Architect"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="e.g., Amazon Web Services"
              value={form.issuer}
              onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Issued Date *"
            value={form.date}
            onChange={value => setForm(f => ({ ...f, date: value }))}
            placeholder="Select issue date"
            required
          />
          <DatePicker
            label="Expiration Date"
            value={form.expirationDate}
            onChange={value => setForm(f => ({ ...f, expirationDate: value }))}
            placeholder="Select expiration date"
            minDate={form.date || undefined}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="Enter credential ID"
              value={form.credentialId}
              onChange={e => setForm(f => ({ ...f, credentialId: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              placeholder="https://"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
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
              <span>{editIndex !== undefined && editIndex !== null ? "Update" : "Add"} Certification</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

