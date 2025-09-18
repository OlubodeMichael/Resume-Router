"use client";
import { X, Edit3 } from "lucide-react";

interface SkillCardProps {
  name: string;
  onEdit?: () => void;
  onDelete?: () => void;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export default function SkillCard({
  name,
  onEdit,
  onDelete,
  level = 'intermediate'
}: SkillCardProps) {
  const getLevelStyles = () => {
    switch (level) {
      case 'beginner':
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          hover: "hover:bg-emerald-100 hover:border-emerald-300",
          accent: "from-emerald-400 to-emerald-500",
          dot: "bg-emerald-400"
        };
      case 'intermediate':
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-800",
          hover: "hover:bg-blue-100 hover:border-blue-300",
          accent: "from-blue-400 to-blue-500",
          dot: "bg-blue-400"
        };
      case 'advanced':
        return {
          bg: "bg-purple-50 border-purple-200 text-purple-800",
          hover: "hover:bg-purple-100 hover:border-purple-300",
          accent: "from-purple-400 to-purple-500",
          dot: "bg-purple-400"
        };
      case 'expert':
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          hover: "hover:bg-amber-100 hover:border-amber-300",
          accent: "from-amber-400 to-amber-500",
          dot: "bg-amber-400"
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200 text-gray-800",
          hover: "hover:bg-gray-100 hover:border-gray-300",
          accent: "from-gray-400 to-gray-500",
          dot: "bg-gray-400"
        };
    }
  };

  const styles = getLevelStyles();

  return (
    <div className={`group relative inline-flex items-center gap-3 ${styles.bg} ${styles.hover} border px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-default`}>
      {/* Skill level indicator */}
      <div className={`w-2 h-2 ${styles.dot} rounded-full`}></div>
      
      {/* Skill name */}
      <span className={`${styles.bg.replace('bg-', 'text-').replace('-50', '-800')} font-semibold tracking-wide`}>
        {name}
      </span>
      
      {/* Skill level badge */}
      <span className={`text-xs px-2 py-1 rounded-full ${styles.bg.replace('bg-', 'bg-').replace('-50', '-100')} ${styles.bg.replace('bg-', 'text-').replace('-50', '-600')} font-medium`}>
        {level}
      </span>
      
      {/* Action buttons */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 ml-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-6 h-6 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105"
            title="Edit skill"
          >
            <Edit3 className="w-3 h-3 text-gray-600" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-6 h-6 bg-white/80 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105"
            title="Delete skill"
          >
            <X className="w-3 h-3 text-red-500" />
          </button>
        )}
      </div>
      
      {/* Animated border on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${styles.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
    </div>
  );
}
