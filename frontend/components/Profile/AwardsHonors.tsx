import { Plus } from "lucide-react";
import AwardHonorCard from "../Cards/AwardHonorCard";

interface AwardHonor {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

interface Profile {
  awardsHonors?: AwardHonor[];
}

interface AwardsHonorsProps {
  profile: Profile | null;
  setShowAwardHonorForm: (show: boolean) => void;
  handleEditAwardHonor: (index: number) => void;
  handleDeleteAwardHonor: (index: number) => void;
}

export default function AwardsHonors({
  profile,
  setShowAwardHonorForm,
  handleEditAwardHonor,
  handleDeleteAwardHonor,
}: AwardsHonorsProps) {
  const awards = profile?.awardsHonors || [];

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Awards &amp; Honors</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowAwardHonorForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-4">
          {awards.length > 0 ? (
            awards.map((award, idx) => (
              <AwardHonorCard
                key={idx}
                title={award.title}
                issuer={award.issuer}
                date={award.date}
                description={award.description}
                onEdit={() => handleEditAwardHonor(idx)}
                onDelete={() => handleDeleteAwardHonor(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No awards or honors added yet</p>
              <button
                onClick={() => setShowAwardHonorForm(true)}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Highlight your achievements →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

