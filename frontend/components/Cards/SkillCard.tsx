"use client";
import { X } from "lucide-react";

interface SkillCardProps {
  name: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SkillCard({
  name,
  onEdit,
  onDelete,
}: SkillCardProps) {
  return (
    <div className="group relative inline-flex items-center justify-center text-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
      <span>{name}</span>
      
      {/* Action buttons - appear on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-4 h-4 bg-blue-200 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            title="Edit skill"
          >
            <span className="text-xs">✏️</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-4 h-4 bg-blue-200 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            title="Delete skill"
          >
            <X className="w-3 h-3 text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
}