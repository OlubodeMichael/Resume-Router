"use client";
import { Pencil, Trash2, Calendar, GraduationCap, Award } from "lucide-react";
import formatDate from "@/lib/formateDate";

interface EducationCardProps {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  gpa?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EducationCard({
  school,
  degree,
  fieldOfStudy,
  location,
  startDate,
  endDate,
  gpa,
  onEdit,
  onDelete,
}: EducationCardProps) {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return (
    <div className=" transition-all duration-200 rounded-xl group">
      {/* Header with school name and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{school}</h3>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              title="Edit education"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete education"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Education details in a clean grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Degree</p>
          <p className="text-gray-900">{degree}</p>
        </div>
        
        {fieldOfStudy && (
          <div>
            <p className="text-sm font-medium text-gray-700">Major</p>
            <p className="text-gray-900">{fieldOfStudy}</p>
          </div>
        )}
        
        {location && (
          <div>
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="text-gray-900">{location}</p>
          </div>
        )}
        
        {gpa && (
          <div>
            <p className="text-sm font-medium text-gray-700">GPA</p>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              <p className="text-amber-600 font-medium">{gpa}</p>
            </div>
          </div>
        )}
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
        <Calendar className="w-4 h-4" />
        <span>
          {formattedStartDate} - {formattedEndDate}
        </span>
      </div>
    </div>
  );
}