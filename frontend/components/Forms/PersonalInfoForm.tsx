"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePersonalInfo } from "../../context/personalInfoProvider";
import { useAuth } from "../../context/authProvider";

interface PersonalInfoData {
  fullName: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  jobTitle: string;
  pronouns: string;
  email: string; // email field is now included in the form
}

interface PersonalInfoFromAPI {
  fullName: string | null;
  phone: string | null;
  location: string | null;
  linkedIn: string | null;
  portfolio: string | null;
  jobTitle: string | null;
  pronouns: string | null;
  email: string | null;
}

interface PersonalInfoFormData {
  fullName: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  jobTitle: string;
  pronouns: string;
  email: string;
}

interface PersonalInfoFormProps {
  onClose: () => void;
  initial?: PersonalInfoFromAPI;
  editIndex?: number | null;
}

export default function PersonalInfoForm({ onClose, initial, editIndex }: PersonalInfoFormProps) {
  const { updatePersonalInfo } = usePersonalInfo();
  const { user } = useAuth();
  const [formData, setFormData] = useState<PersonalInfoData>({
    fullName: (user?.name ?? "") || "",
    phone: "",
    location: "",
    linkedIn: "",
    portfolio: "",
    jobTitle: "",
    pronouns: "",
    email: (user?.email ?? "") || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data if editing, but always use user's name and email as fallback
  useEffect(() => {
    if (initial) {
      setFormData({
        fullName: initial.fullName || (user?.name ?? "") || "",
        phone: initial.phone || "",
        location: initial.location || "",
        linkedIn: initial.linkedIn || "",
        portfolio: initial.portfolio || "",
        jobTitle: initial.jobTitle || "",
        pronouns: initial.pronouns || "",
        email: initial.email || (user?.email ?? "") || ""
      });
    } else if (user?.name || user?.email) {
      setFormData(prev => ({
        ...prev,
        fullName: (user?.name ?? "") || prev.fullName,
        email: (user?.email ?? "") || prev.email
      }));
    }
  }, [initial, user?.name, user?.email]);

  const handleInputChange = (field: keyof PersonalInfoData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const formatUrl = (url: string): string => {
    if (!url) return '';
    
    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Add https:// protocol for external links
    return `https://${url}`;
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Send all form data including email
      const dataToSend: PersonalInfoFormData = {
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        linkedIn: formatUrl(formData.linkedIn),
        portfolio: formatUrl(formData.portfolio),
        jobTitle: formData.jobTitle,
        pronouns: formData.pronouns,
        email: formData.email
      };
      await updatePersonalInfo(dataToSend);
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to update personal information");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {editIndex !== null ? "Edit Personal Information" : "Add Personal Information"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, State/Province, Country"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Software Engineer, Product Manager"
            />
          </div>

          {/* Pronouns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pronouns
            </label>
            <select
              value={formData.pronouns}
              onChange={(e) => handleInputChange("pronouns", e.target.value)}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select pronouns</option>
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
              <option value="they/them">they/them</option>
              <option value="he/they">he/they</option>
              <option value="she/they">she/they</option>
              <option value="ze/hir">ze/hir</option>
              <option value="ze/zir">ze/zir</option>
              <option value="xe/xem">xe/xem</option>
              <option value="other">Other (please specify)</option>
            </select>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Profile
            </label>
            <input
              type="text"
              value={formData.linkedIn}
              onChange={(e) => handleInputChange("linkedIn", e.target.value)}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="linkedin.com/in/yourprofile or https://linkedin.com/in/yourprofile"
            />
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Website
            </label>
            <input
              type="text"
              value={formData.portfolio}
              onChange={(e) => handleInputChange("portfolio", e.target.value)}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="yourportfolio.com or https://yourportfolio.com"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving..." : (editIndex !== null ? "Update" : "Save")}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}