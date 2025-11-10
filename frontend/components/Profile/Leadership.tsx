import { Plus } from "lucide-react";
import LeadershipCard from "../Cards/LeadershipCard";

interface LeadershipActivity {
  org: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  achievements?: string[];
}

interface Profile {
  leadership?: LeadershipActivity[];
}

interface LeadershipProps {
  profile: Profile | null;
  setShowLeadershipForm: (show: boolean) => void;
  handleEditLeadership: (index: number) => void;
  handleDeleteLeadership: (index: number) => void;
}

export default function LeadershipSection({
  profile,
  setShowLeadershipForm,
  handleEditLeadership,
  handleDeleteLeadership,
}: LeadershipProps) {
  const leadershipActivities = profile?.leadership || [];

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Leadership</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowLeadershipForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-4">
          {leadershipActivities.length > 0 ? (
            leadershipActivities.map((activity, idx) => (
              <LeadershipCard
                key={idx}
                org={activity.org}
                position={activity.position}
                startDate={activity.startDate}
                endDate={activity.endDate}
                achievements={activity.achievements}
                onEdit={() => handleEditLeadership(idx)}
                onDelete={() => handleDeleteLeadership(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No leadership activities added yet</p>
              <button
                onClick={() => setShowLeadershipForm(true)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Highlight your leadership →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

