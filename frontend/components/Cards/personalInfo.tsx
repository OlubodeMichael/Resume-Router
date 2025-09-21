"use client";

import React, { useState } from "react";
import { User, Edit3 } from "lucide-react";
import PersonalInfoForm from "../Forms/PersonalInfoForm";
import { usePersonalInfo } from "../../context/personalInfoProvider";
//import { useAuth } from "../../context/authProvider";

export default function PersonalInfo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { personalInfo, loading } = usePersonalInfo();
  //const { user } = useAuth();

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
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ) : personalInfo ? (
          <div className="space-y-4">
            {/* Top Row - Name and Job Title */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Full Name</div>
                <div className="text-sm text-gray-900 font-medium">{personalInfo.fullName || "Not provided"}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Job Title</div>
                <div className="text-sm text-gray-900 font-medium">{personalInfo.jobTitle || "Not provided"}</div>
              </div>
            </div>

            {/* Middle Row - Contact Info */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</div>
                <div className="text-sm text-gray-900 font-medium">{personalInfo.email || "Not provided"}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</div>
                <div className="text-sm text-gray-900 font-medium">{personalInfo.phone || "Not provided"}</div>
              </div>
            </div>

            {/* Bottom Row - Location and Pronouns */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</div>
                <div className="text-sm text-gray-900 font-medium">{personalInfo.location || "Not provided"}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pronouns</div>
                <div className="text-sm text-gray-900 font-medium">{personalInfo.pronouns || "Not provided"}</div>
              </div>
            </div>

            {/* Social Links Row */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">LinkedIn</div>
                  {personalInfo.linkedIn ? (
                    <a 
                      href={personalInfo.linkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500">Not provided</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Portfolio</div>
                  {personalInfo.portfolio ? (
                    <a 
                      href={personalInfo.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                    >
                      Visit Website
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500">Not provided</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">No personal information available</div>
            <button
              onClick={openModal}
              className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Add personal information
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <PersonalInfoForm 
            onClose={closeModal} 
            initial={personalInfo || undefined}
            editIndex={personalInfo ? 0 : null}
          />
        </div>
      )}
    </>
  );
}