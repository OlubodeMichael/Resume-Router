import { Plus } from "lucide-react";
import ReferenceCard from "../Cards/ReferenceCard";

interface Reference {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  relation?: string;
}

interface Profile {
  references?: Reference[];
}

interface ReferenceProps {
  profile: Profile | null;
  setShowReferenceForm: (show: boolean) => void;
  handleEditReference: (index: number) => void;
  handleDeleteReference: (index: number) => void;
}

export default function ReferenceSection({
  profile,
  setShowReferenceForm,
  handleEditReference,
  handleDeleteReference,
}: ReferenceProps) {
  const references = profile?.references || [];

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">References</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowReferenceForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-4">
          {references.length > 0 ? (
            references.map((reference, idx) => (
              <ReferenceCard
                key={idx}
                name={reference.name}
                title={reference.title}
                company={reference.company}
                email={reference.email}
                phone={reference.phone}
                relation={reference.relation}
                onEdit={() => handleEditReference(idx)}
                onDelete={() => handleDeleteReference(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No references added yet</p>
              <button
                onClick={() => setShowReferenceForm(true)}
                className="text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                Add your first reference →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

