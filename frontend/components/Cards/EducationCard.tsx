"use client";
import { Pencil, Trash2, Calendar, GraduationCap } from "lucide-react";
import formatDate from "@/lib/formateDate";

interface EducationCardProps {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EducationCard({
  school,
  degree,
  fieldOfStudy,
  startDate,
  endDate,
  onEdit,
  onDelete,
}: EducationCardProps) {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return (
    <div className="bg-white hover:bg-gray-50 transition-all duration-200 rounded-xl shadow-sm border border-gray-100 p-6 group">
      {/* Header with degree, school, and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">{degree}</h3>
          </div>
          <p className="text-gray-600 font-medium">{school}</p>
          {fieldOfStudy && (
            <p className="text-gray-500 text-sm mt-1">{fieldOfStudy}</p>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              title="Edit education"
            >
              <Pencil className="w-4 h-4 text-green-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete education"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>
          {formattedStartDate} - {formattedEndDate}
        </span>
      </div>
    </div>
  );
}