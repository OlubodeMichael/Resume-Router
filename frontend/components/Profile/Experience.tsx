import { Plus } from "lucide-react";
import ExperienceCard from "../Cards/ExperienceCard";

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  responsibilities?: string[];
}

interface Profile {
  experience?: Experience[];
}

interface ExperienceProps {
  profile: Profile | null;
  setShowExpForm: (show: boolean) => void;
  handleEditExperience: (index: number) => void;
  handleDeleteExperience: (index: number) => void;
}

export default function Experience( { profile, setShowExpForm, handleEditExperience, handleDeleteExperience }: ExperienceProps ) {
  return <section className="mb-8">
  <div className="bg-white rounded-xl border-[1px] p-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Work Experience</h2>
      <button
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        onClick={() => setShowExpForm(true)}
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </div>
    
    <div className="space-y-4">
      {profile?.experience && profile.experience.length > 0 ? (
        profile.experience.map((exp: Experience, idx: number) => (
          <ExperienceCard
            key={idx}
            title={exp.title}
            company={exp.company}
            startDate={exp.startDate}
            endDate={exp.endDate}
            responsibilities={exp.responsibilities || []}
            onEdit={() => handleEditExperience(idx)}
            onDelete={() => handleDeleteExperience(idx)}
          />
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3 text-sm sm:text-base">No work experience added yet</p>
          <button
            onClick={() => setShowExpForm(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Add your first experience →
          </button>
        </div>
      )}
    </div>
  </div>
</section>
}