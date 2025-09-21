"use client";
import { X, Edit3 } from "lucide-react";

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
    <div className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-900 px-4 py-2.5 rounded-xl text-sm font-medium hover:from-blue-100 hover:to-indigo-100 hover:border-blue-200 transition-all duration-200 cursor-default">
      {/* Skill name with better typography */}
      <span className="text-blue-900 font-semibold tracking-wide">{name}</span>
      
      {/* Action buttons - appear on hover with smooth animation */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 ml-1">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-6 h-6 bg-white/80 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105"
            title="Edit skill"
          >
            <Edit3 className="w-3 h-3 text-blue-600" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-6 h-6 bg-white/80 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105"
            title="Delete skill"
          >
            <X className="w-3 h-3 text-red-500" />
          </button>
        )}
      </div>
      
     
    </div>
  );
}