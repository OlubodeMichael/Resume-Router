"use client";
import { Pencil, Trash2, Award, Calendar, Building } from "lucide-react";
import formatDate from "@/lib/formateDate";

interface AwardHonorCardProps {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function AwardHonorCard({
  title,
  issuer,
  date,
  description,
  onEdit,
  onDelete,
}: AwardHonorCardProps) {
  const formattedDate = formatDate(date);

  return (
    <div className="group rounded-xl transition-all duration-200 border border-gray-100 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {issuer && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{issuer}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit award"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete award"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {date && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
      )}

      {description && (
        <p className="text-sm text-gray-700 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

