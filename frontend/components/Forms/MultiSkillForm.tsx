"use client";
import { useProfile } from "@/hooks/profileProvider";
import { X } from "lucide-react";
import SkillInput from "./SkillInput";

interface MultiSkillFormProps {
  onClose?: () => void;
  existingSkills?: string[];
}

export default function MultiSkillForm({ onClose, existingSkills = [] }: MultiSkillFormProps) {
  const { postBulkSkills } = useProfile();

  const handleSaveSkills = async (skills: string[]) => {
    await postBulkSkills(skills);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Add Skills</h3>
          <p className="text-sm text-gray-500 mt-1">
            Type a skill and press Enter or comma to add it to the list. Click &quot;Done&quot; to save all skills to the database.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <SkillInput
        onSave={handleSaveSkills}
        existingItems={existingSkills}
        placeholder="Type a skill and press Enter (e.g., React, Python, Project Management)"
        label=""
        description=""
        maxItems={50}
        className=""
      />
    </div>
  );
}