"use client";
import { Pencil, Link2 } from "lucide-react";

interface LinksCardProps {
  name: string;
  url: string;
  onEdit?: () => void;
}

export default function LinksCard({
  name,
  url,
  onEdit,
}: LinksCardProps) {
  const formatUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="group rounded-xl transition-all duration-200 border border-gray-100 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          </div>
          <a
            href={formatUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
          >
            {url}
          </a>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-100 rounded-lg transition-all"
            title="Edit link"
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}

