"use client";
import { Pencil, Trash2, Calendar, Users, Link2 } from "lucide-react";
import formatDate from "@/lib/formateDate";

interface VolunteerCardProps {
  org: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  impact?: string[];
  url?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function VolunteerCard({
  org,
  role,
  startDate,
  endDate,
  impact,
  url,
  onEdit,
  onDelete,
}: VolunteerCardProps) {
  const formattedStart = formatDate(startDate || undefined);
  const formattedEnd = formatDate(endDate || undefined);

  return (
    <div className="group rounded-xl transition-all duration-200 border border-gray-100 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">{org}</h3>
          </div>
          {role && <p className="text-sm text-gray-600">{role}</p>}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit volunteer experience"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete volunteer experience"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {(startDate || endDate) && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {formattedStart} - {formattedEnd}
          </span>
        </div>
      )}

      {impact && impact.length > 0 && (
        <ul className="space-y-1 text-sm text-gray-700">
          {impact.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {url && (
        <div className="flex items-center gap-2 text-sm text-blue-600 mt-4">
          <Link2 className="w-4 h-4" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
            Learn more
          </a>
        </div>
      )}
    </div>
  );
}

