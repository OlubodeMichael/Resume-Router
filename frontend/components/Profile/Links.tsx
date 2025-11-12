import { Plus, Link2 } from "lucide-react";
import LinksCard from "../Cards/LinksCard";

interface Links {
  name: string;
  url: string;
}

interface Profile {
  links?: Links[];
}

interface LinksProps {
  profile: Profile | null;
  setShowLinksForm: (show: boolean) => void;
  handleEditLinks: () => void;
}

export default function LinksSection({
  profile,
  setShowLinksForm,
  handleEditLinks,
}: LinksProps) {
  const links = profile?.links || [];

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Links</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowLinksForm(true)}
          >
            <Plus className="w-4 h-4" />
            {links.length > 0 ? "Edit" : "Add"}
          </button>
        </div>

        <div className="space-y-4">
          {links.length > 0 ? (
            links.map((link, idx) => (
              <LinksCard
                key={idx}
                name={link.name}
                url={link.url}
                onEdit={handleEditLinks}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No links added yet</p>
              <button
                onClick={() => setShowLinksForm(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add your first link →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

