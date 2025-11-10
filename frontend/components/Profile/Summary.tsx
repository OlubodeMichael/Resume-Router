import { Pencil } from "lucide-react";

interface SummaryProps {
  summary?: string | null;
  setShowSummaryForm: (show: boolean) => void;
  handleClearSummary: () => void;
}

export default function SummarySection({
  summary,
  setShowSummaryForm,
  handleClearSummary,
}: SummaryProps) {
  const hasSummary = Boolean(summary && summary.trim().length > 0);

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Professional Summary</h2>
          <div className="flex items-center gap-2">
            {hasSummary && (
              <button
                onClick={handleClearSummary}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowSummaryForm(true)}
            >
              <Pencil className="w-4 h-4" />
              {hasSummary ? "Edit" : "Add"}
            </button>
          </div>
        </div>

        {hasSummary ? (
          <p className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-line">
            {summary}
          </p>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 text-sm sm:text-base mb-2">No summary added yet</p>
            <button
              onClick={() => setShowSummaryForm(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Craft your professional summary →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

