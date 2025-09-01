"use client";

import React, { useState } from "react";
import { User, Edit3 } from "lucide-react";
import PersonalInfoForm from "../Forms/PersonalInfoForm";

// Dummy data for display
const dummyPersonalInfo = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA, USA",
  linkedIn: "https://linkedin.com/in/johndoe",
  portfolio: "https://johndoe.dev",
  jobTitle: "Senior Software Engineer",
  pronouns: "he/him",
};

export default function PersonalInfo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="bg-white  ">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
              <p className="text-xs text-gray-500">Contact and professional details</p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Personal Information"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Top Row - Name and Job Title */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Full Name</div>
              <div className="text-sm text-gray-900 font-medium">{dummyPersonalInfo.fullName}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Job Title</div>
              <div className="text-sm text-gray-900 font-medium">{dummyPersonalInfo.jobTitle}</div>
            </div>
          </div>

          {/* Middle Row - Contact Info */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</div>
              <div className="text-sm text-gray-900 font-medium">{dummyPersonalInfo.email}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</div>
              <div className="text-sm text-gray-900 font-medium">{dummyPersonalInfo.phone}</div>
            </div>
          </div>

          {/* Bottom Row - Location and Pronouns */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</div>
              <div className="text-sm text-gray-900 font-medium">{dummyPersonalInfo.location}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pronouns</div>
              <div className="text-sm text-gray-900 font-medium">{dummyPersonalInfo.pronouns}</div>
            </div>
          </div>

          {/* Social Links Row */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">LinkedIn</div>
                <a 
                  href={dummyPersonalInfo.linkedIn} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                >
                  View Profile
                </a>
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Portfolio</div>
                <a 
                  href={dummyPersonalInfo.portfolio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <PersonalInfoForm onClose={closeModal} />
        </div>
      )}
    </>
  );
}