"use client";
import { Pencil, Trash2, Calendar, Code, ExternalLink } from "lucide-react";
import formatDate from "@/lib/formateDate";

interface ProjectCardProps {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProjectCard({
  name,
  description,
  technologies,
  url,
  startDate,
  endDate,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return (
    <div className="bg-white hover:bg-gray-50 transition-all duration-200 rounded-xl shadow-sm border border-gray-100 p-6 group">
      {/* Header with project name and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Code className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-purple-100 rounded transition-colors"
                title="View Project"
              >
                <ExternalLink className="w-4 h-4 text-purple-600" />
              </a>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
              title="Edit project"
            >
              <Pencil className="w-4 h-4 text-purple-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 leading-relaxed">{description}</p>

      {/* Technologies */}
      {technologies && technologies.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Technologies:</h4>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

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