"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
import ExperienceForm from "../Forms/ExperienceForm";
import { Plus } from "lucide-react";

export default function Profile() {
  const { profile, loading, error } = useProfile();
  const [showExpForm, setShowExpForm] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-2xl font-bold text-black mb-2">Your profile is used to create your resume</h2>

      {/* Experience Section */}
      <section className="bg-white rounded-md p-4 shadow flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-black">Experience</h3>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => setShowExpForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {/* List Experience Entries */}
        <div className="flex flex-col gap-4">
          {profile?.experience && profile.experience.length > 0 ? (
            profile.experience.map((exp, idx) => (
              <div
                key={idx}
                className="  rounded-lg shadow-sm p-5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-lg text-blue-900">{exp.title}</span>
                    <span className="text-gray-600 font-medium ml-2">@ {exp.company}</span>
                  </div>
                  <div className="flex gap-2">
                    {/* Add edit/delete buttons here, e.g. <button>✏️</button> <button>🗑️</button> */}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {exp.startDate} - {exp.endDate || "Present"}
                </div>
                <ul className="list-disc ml-5 text-gray-700 text-sm">
                  {exp.responsibilities?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-8">No experience added yet.</div>
          )}
        </div>
        {/* Show Form Modal */}
        {showExpForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <ExperienceForm onClose={() => setShowExpForm(false)} />
          </div>
        )}
      </section>
    </div>
  );
}