// app/components/ResumeLoading.tsx
"use client";

interface ResumeLoadingProps {
  message?: "tailoring" | "loading";
}

export default function ResumeLoading({ message = "loading" }: ResumeLoadingProps) {
  const displayMessage = message === "tailoring" 
    ? "Tailoring your resume..." 
    : "Loading resume...";

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[850px]">
        {/* Status message */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 border border-gray-200">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-gray-700">{displayMessage}</span>
          </div>
        </div>

        {/* Resume skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-12 space-y-8">
          {/* Header - Name and contact */}
          <div className="space-y-3 pb-6 border-b border-gray-200">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Summary section */}
          <div className="space-y-3">
            <div className="h-5 w-32 bg-gray-300 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Experience section */}
          <div className="space-y-4">
            <div className="h-5 w-40 bg-gray-300 rounded animate-pulse" />
            
            {/* Experience item 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-1.5 mt-2">
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>

            {/* Experience item 2 */}
            <div className="space-y-2 pt-3">
              <div className="flex justify-between items-start">
                <div className="h-4 w-52 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-1.5 mt-2">
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Education section */}
          <div className="space-y-3">
            <div className="h-5 w-32 bg-gray-300 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-44 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Skills section */}
          <div className="space-y-3">
            <div className="h-5 w-24 bg-gray-300 rounded animate-pulse" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-7 w-28 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-7 w-32 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div 
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
              style={{
                animation: 'slide 2s ease-in-out infinite'
              }}
            />
          </div>
          <style jsx>{`
            @keyframes slide {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(400%); }
            }
          `}</style>
        </div>

        {/* Footnote */}
        <p className="mt-4 text-center text-xs text-gray-500">
          This usually takes a few seconds
        </p>
      </div>
    </div>
  );
}
