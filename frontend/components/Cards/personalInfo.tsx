"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Linkedin, Globe, Briefcase, UserCheck, Edit3 } from "lucide-react";
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
              <p className="text-sm text-slate-500">Contact and professional details</p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit Personal Information"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name and Job Title */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-1">
                <User className="w-4 h-4 mr-2" />
                Full Name
              </div>
              <div className="text-slate-900 font-medium">{dummyPersonalInfo.fullName}</div>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-1">
                <Briefcase className="w-4 h-4 mr-2" />
                Job Title
              </div>
              <div className="text-slate-900 font-medium">{dummyPersonalInfo.jobTitle}</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-1">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </div>
              <div className="text-slate-900 font-medium">{dummyPersonalInfo.email}</div>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-1">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </div>
              <div className="text-slate-900 font-medium">{dummyPersonalInfo.phone}</div>
            </div>
          </div>

          {/* Location and Pronouns */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-1">
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </div>
              <div className="text-slate-900 font-medium">{dummyPersonalInfo.location}</div>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-1">
                <UserCheck className="w-4 h-4 mr-2" />
                Pronouns
              </div>
              <div className="text-slate-900 font-medium">{dummyPersonalInfo.pronouns}</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-1">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </div>
              <a 
                href={dummyPersonalInfo.linkedIn} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline text-sm"
              >
                View Profile
              </a>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-slate-500 mb-1">
                <Globe className="w-4 h-4 mr-2" />
                Portfolio
              </div>
              <a 
                href={dummyPersonalInfo.portfolio} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline text-sm"
              >
                Visit Website
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-[0.9] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Edit Personal Information</h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <PersonalInfoForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}