import { Pencil } from "lucide-react";

interface ObjectiveProps {
  objective?: string | null;
  setShowObjectiveForm: (show: boolean) => void;
  handleClearObjective: () => void;
}

export default function ObjectiveSection({
  objective,
  setShowObjectiveForm,
  handleClearObjective,
}: ObjectiveProps) {
  const hasObjective = Boolean(objective && objective.trim().length > 0);

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Career Objective</h2>
          <div className="flex items-center gap-2">
            {hasObjective && (
              <button
                onClick={handleClearObjective}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowObjectiveForm(true)}
            >
              <Pencil className="w-4 h-4" />
              {hasObjective ? "Edit" : "Add"}
            </button>
          </div>
        </div>

        {hasObjective ? (
          <p className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-line">
            {objective}
          </p>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 text-sm sm:text-base mb-2">No objective added yet</p>
            <button
              onClick={() => setShowObjectiveForm(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Define your next goal →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

