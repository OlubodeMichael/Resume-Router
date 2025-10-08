// app/dashboard/page.tsx
'use client'
import JobDescription from "@/components/Dashboard/jobDescription";

export default function Dashboard() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 w-[60%]">
      <div className="w-full max-w-3xl rounded-lg">
        <p className="text-center text-xl font-medium text-gray-900 mb-4">
          Generate a resume that actually matches the job
        </p>
        <JobDescription />
      </div>
    </main>
  );
}
