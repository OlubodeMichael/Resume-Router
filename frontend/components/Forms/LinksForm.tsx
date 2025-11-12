"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/profileProvider";
import { Link2, Loader2, X, Plus, Trash2 } from "lucide-react";

interface LinksFormProps {
  initial?: Array<{ name: string; url: string }>;
  onClose?: () => void;
}

export default function LinksForm({ initial, onClose }: LinksFormProps) {
  const { updateLinks } = useProfile();
  const [links, setLinks] = useState<Array<{ name: string; url: string }>>(
    initial || [{ name: "", url: "" }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial && initial.length > 0) {
      setLinks(initial);
    } else {
      setLinks([{ name: "", url: "" }]);
    }
  }, [initial]);

  const addLinkField = () => {
    setLinks([...links, { name: "", url: "" }]);
  };

  const removeLinkField = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const updateLink = (index: number, field: "name" | "url", value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Filter out empty links
    const validLinks = links.filter(link => link.name.trim() && link.url.trim());

    if (validLinks.length === 0) {
      setError("At least one link with both name and URL is required.");
      return;
    }

    // Validate URLs
    for (const link of validLinks) {
      try {
        new URL(link.url);
      } catch {
        setError(`Invalid URL format for "${link.name}". Please include http:// or https://`);
        return;
      }
    }

    setLoading(true);
    try {
      await updateLinks(validLinks);
      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save links.");
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
              <Link2 className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Manage Links</h2>
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

        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Name *
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                    placeholder="e.g., LinkedIn, GitHub, Portfolio"
                    value={link.name}
                    onChange={e => updateLink(index, "name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL *
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                    placeholder="https://"
                    value={link.url}
                    onChange={e => updateLink(index, "url", e.target.value)}
                    required
                  />
                </div>
              </div>
              {links.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLinkField(index)}
                  className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLinkField}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Another Link
        </button>

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
              <span>Save Links</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

