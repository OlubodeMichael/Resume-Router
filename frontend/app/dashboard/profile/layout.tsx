"use client";
import { useState } from "react";
import Profile from "@/components/Ui/Profile";
import PersonalInfo from "@/components/Ui/PersonalInfo";

export default function ProfileLayout() {
  const [activeTab, setActiveTab] = useState<"profile" | "personalInfo">("profile");

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header with Tabs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === "profile"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("personalInfo")}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === "personalInfo"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                Personal Info
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area with Conditional Rendering */}
        <div className="mt-6">
          {activeTab === "profile" ? <Profile /> : <PersonalInfo />}
        </div>
      </div>
    </div>
  );
}