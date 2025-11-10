import { Plus } from "lucide-react";
import PublicationCard from "../Cards/PublicationCard";

interface Publication {
  title: string;
  venue?: string;
  date?: string;
  url?: string;
  summary?: string;
}

interface Profile {
  publications?: Publication[];
}

interface PublicationProps {
  profile: Profile | null;
  setShowPublicationForm: (show: boolean) => void;
  handleEditPublication: (index: number) => void;
  handleDeletePublication: (index: number) => void;
}

export default function PublicationSection({
  profile,
  setShowPublicationForm,
  handleEditPublication,
  handleDeletePublication,
}: PublicationProps) {
  const publications = profile?.publications || [];

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Publications</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowPublicationForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-4">
          {publications.length > 0 ? (
            publications.map((publication, idx) => (
              <PublicationCard
                key={idx}
                title={publication.title}
                venue={publication.venue}
                date={publication.date}
                url={publication.url}
                summary={publication.summary}
                onEdit={() => handleEditPublication(idx)}
                onDelete={() => handleDeletePublication(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No publications added yet</p>
              <button
                onClick={() => setShowPublicationForm(true)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Share your publications →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

