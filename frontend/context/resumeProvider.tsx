"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  jobTitle?: string;
  pronouns?: string;
  experience?: Array<{
    title: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }>;
  education?: Array<{
    institution: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills?: string[];
  summary?: string;
}

interface ResumeContextType {
  resume: File | null;
  setResume: (resume: File | null) => void;
  parsedResume: ParsedResumeData | null;
  setParsedResume: (data: ParsedResumeData | null) => void;
  isLoading: boolean;
  error: string | null;
  parseResume: (file: File) => Promise<void>;
  clearResume: () => void;
  clearError: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [resume, setResume] = useState<File | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const parseResume = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setResume(file);

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or DOCX file');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resume', file);

      // Get auth token from cookies or localStorage
      //const token = localStorage.getItem('authToken') || '';
      
      const response = await fetch(`${API_BASE_URL}/api/resumes/parse`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse resume' }));
        console.error(errorData);
        throw new Error(errorData.message || 'Failed to parse resume');
      }

      const data = await response.json();
      
      if (data.data) {
        setParsedResume(data.data);
      } else {
        throw new Error('No data received from server');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error(errorMessage);
      setError(errorMessage);
      setParsedResume(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResume = () => {
    setResume(null);
    setParsedResume(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: ResumeContextType = {
    resume,
    setResume,
    parsedResume,
    setParsedResume,
    isLoading,
    error,
    parseResume,
    clearResume,
    clearError,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};