"use client";
import { X, Edit3, Sparkles } from "lucide-react";

interface SkillCardProps {
  name: string;
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: 'default' | 'premium' | 'minimal';
}

export default function SkillCard({
  name,
  onEdit,
  onDelete,
  variant = 'default'
}: SkillCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return {
          container: "bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 text-slate-800 hover:from-slate-100 hover:to-gray-200 hover:border-slate-300",
          text: "text-slate-800 font-semibold",
          icon: "text-slate-600",
          accent: "from-slate-400 to-gray-400"
        };
      case 'minimal':
        return {
          container: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
          text: "text-gray-700 font-medium",
          icon: "text-gray-500",
          accent: "from-gray-300 to-gray-400"
        };
      default:
        return {
          container: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-900 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-200",
          text: "text-blue-900 font-semibold",
          icon: "text-blue-600",
          accent: "from-blue-400 to-indigo-400"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`group relative inline-flex items-center gap-3 ${styles.container} px-4 py-3 rounded-2xl text-sm transition-all duration-200 cursor-default`}>
      {/* Skill icon for premium variant */}
      {variant === 'premium' && (
        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}
      
      {/* Skill name with better typography */}
      <span className={`${styles.text} tracking-wide`}>{name}</span>
      
      {/* Action buttons - appear on hover with smooth animation */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 ml-1">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-7 h-7 bg-white/90 hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-105 border border-gray-200/50"
            title="Edit skill"
          >
            <Edit3 className={`w-3.5 h-3.5 ${styles.icon}`} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-7 h-7 bg-white/90 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-105 border border-gray-200/50"
            title="Delete skill"
          >
            <X className="w-3.5 h-3.5 text-red-500" />
          </button>
        )}
      </div>
      
      {/* Subtle accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.accent} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
    </div>
  );
}
