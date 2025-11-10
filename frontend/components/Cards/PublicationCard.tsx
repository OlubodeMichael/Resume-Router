"use client";
import { Pencil, Trash2, BookOpen, Calendar, Link2 } from "lucide-react";
import formatDate from "@/lib/formateDate";

interface PublicationCardProps {
  title: string;
  venue?: string;
  date?: string;
  url?: string;
  summary?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PublicationCard({
  title,
  venue,
  date,
  url,
  summary,
  onEdit,
  onDelete,
}: PublicationCardProps) {
  const publishedOn = formatDate(date);

  return (
    <div className="group rounded-xl transition-all duration-200 border border-gray-100 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {venue && <p className="text-sm text-gray-600">{venue}</p>}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit publication"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete publication"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {date && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4" />
          <span>{publishedOn}</span>
        </div>
      )}

      {summary && (
        <p className="text-sm text-gray-700 leading-relaxed">
          {summary}
        </p>
      )}

      {url && (
        <div className="flex items-center gap-2 text-sm text-indigo-600 mt-4">
          <Link2 className="w-4 h-4" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
            Read publication
          </a>
        </div>
      )}
    </div>
  );
}

