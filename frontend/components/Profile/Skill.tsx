import { Plus } from "lucide-react";
import SkillCard from "../Cards/SkillCard";


interface Profile {
  skills?: string[];
}

interface SkillProps {
  profile: Profile | null;
  setShowSkillForm: (show: boolean) => void;
  handleEditSkill: (index: number) => void;
  handleDeleteSkill: (index: number) => void;
}

export default function Skill({ profile, setShowSkillForm, handleEditSkill, handleDeleteSkill }: SkillProps) {
  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Skills</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowSkillForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add Skills
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill: string, idx: number) => (
              <SkillCard
                key={idx}
                name={skill}
                onEdit={() => handleEditSkill(idx)}
                onDelete={() => handleDeleteSkill(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12 w-full">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No skills added yet</p>
              <button
                onClick={() => setShowSkillForm(true)}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Add your first skills →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}