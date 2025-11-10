import { Plus } from "lucide-react";
import VolunteerCard from "../Cards/VolunteerCard";

interface VolunteerExperience {
  org: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  impact?: string[];
  url?: string;
}

interface Profile {
  volunteer?: VolunteerExperience[];
}

interface VolunteerProps {
  profile: Profile | null;
  setShowVolunteerForm: (show: boolean) => void;
  handleEditVolunteer: (index: number) => void;
  handleDeleteVolunteer: (index: number) => void;
}

export default function VolunteerSection({
  profile,
  setShowVolunteerForm,
  handleEditVolunteer,
  handleDeleteVolunteer,
}: VolunteerProps) {
  const volunteerExperiences = profile?.volunteer || [];

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Volunteer Experience</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowVolunteerForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-4">
          {volunteerExperiences.length > 0 ? (
            volunteerExperiences.map((volunteer, idx) => (
              <VolunteerCard
                key={idx}
                org={volunteer.org}
                role={volunteer.role}
                startDate={volunteer.startDate}
                endDate={volunteer.endDate}
                impact={volunteer.impact}
                url={volunteer.url}
                onEdit={() => handleEditVolunteer(idx)}
                onDelete={() => handleDeleteVolunteer(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No volunteer experience added yet</p>
              <button
                onClick={() => setShowVolunteerForm(true)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Share your community impact →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

