"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Linkedin, Globe, Briefcase, UserCheck } from "lucide-react";

interface PersonalInfoData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  jobTitle: string;
  pronouns: string;
}

export default function PersonalInfoForm() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    portfolio: "",
    jobTitle: "",
    pronouns: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: keyof PersonalInfoData, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving personal info:", personalInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form if needed
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
            <p className="text-sm text-slate-500">Your basic contact and professional details</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Full Name
          </label>
          <input
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border text-gray-700 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Mail className="inline w-4 h-4 mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border text-gray-700 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            placeholder="Enter your email address"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border text-gray-700 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Location
          </label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border text-gray-700 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            placeholder="City, State/Province, Country"
          />
        </div>

        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Briefcase className="inline w-4 h-4 mr-2" />
            Job Title
          </label>
          <input
            type="text"
            value={personalInfo.jobTitle}
            onChange={(e) => handleInputChange("jobTitle", e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border text-gray-700 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            placeholder="e.g., Software Engineer, Product Manager"
          />
        </div>

        {/* Pronouns */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <UserCheck className="inline w-4 h-4 mr-2" />
            Pronouns
          </label>
          <input
            type="text"
            value={personalInfo.pronouns}
            onChange={(e) => handleInputChange("pronouns", e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border text-gray-700 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            placeholder="e.g., he/him, she/her, they/them"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Linkedin className="inline w-4 h-4 mr-2" />
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={personalInfo.linkedIn}
            onChange={(e) => handleInputChange("linkedIn", e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border text-gray-700 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        {/* Portfolio */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Globe className="inline w-4 h-4 mr-2" />
            Portfolio Website
          </label>
          <input
            type="url"
            value={personalInfo.portfolio}
            onChange={(e) => handleInputChange("portfolio", e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border text-gray-700 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            placeholder="https://yourportfolio.com"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex space-x-3 mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-slate-100 text-slate-700 py-2 px-4 rounded-lg font-medium hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}