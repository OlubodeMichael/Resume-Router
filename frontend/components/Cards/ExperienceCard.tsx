"use client";
import { Pencil, Trash2, Calendar, Building } from "lucide-react";
import formatDate from "@/lib/formateDate";

interface ExperienceCardProps {
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  responsibilities: string[];
  onEdit?: () => void;
  onDelete?: () => void;
}



export default function ExperienceCard({
  title,
  company,
  startDate,
  endDate,
  responsibilities,
  onEdit,
  onDelete,
}: ExperienceCardProps) {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return (
    <div className="bg-white hover:bg-gray-50 transition-all duration-200 rounded-xl shadow-sm border border-gray-100 p-6 group">
      {/* Header with title, company, and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 font-medium">{company}</p>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit experience"
            >
              <Pencil className="w-4 h-4 text-blue-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete experience"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>
          {formattedStartDate} - {formattedEndDate}
        </span>
      </div>

      {/* Responsibilities */}
      {responsibilities && responsibilities.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Responsibilities:</h4>
          <ul className="space-y-1">
            {responsibilities.map((responsibility, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>{responsibility}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}