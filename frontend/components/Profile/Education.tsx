import { Plus } from "lucide-react";
import EducationCard from "../Cards/EducationCard";

interface Education {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string | null;
  gpa?: string;
}

interface Profile {
  education?: Education[];
}

interface EducationProps {
  profile: Profile | null;
  setShowEduForm: (show: boolean) => void;
  handleEditEducation: (index: number) => void;
  handleDeleteEducation: (index: number) => void;
}

export default function Education( { profile, setShowEduForm, handleEditEducation, handleDeleteEducation }: EducationProps ) {
  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Education</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowEduForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        
        <div className="space-y-4">
          {profile?.education && profile.education.length > 0 ? (
            profile.education.map((edu: Education, idx: number) => (
              <EducationCard
                key={idx}
                school={edu.school}
                degree={edu.degree}
                fieldOfStudy={edu.fieldOfStudy}
                startDate={edu.startDate}
                endDate={edu.endDate}
                gpa={edu.gpa}
                onEdit={() => handleEditEducation(idx)}
                onDelete={() => handleDeleteEducation(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No education added yet</p>
              <button
                onClick={() => setShowEduForm(true)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Add your first education →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}