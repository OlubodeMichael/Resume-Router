"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "./authProvider";

interface PersonalInfo {
  fullName: string | null;
  phone: string | null;
  location: string | null;
  linkedIn: string | null;
  portfolio: string | null;
  jobTitle: string | null;
  pronouns: string | null;
  email: string | null; // Email is auto-populated from User table into PersonalInformation
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

interface PersonalInfoContextType {
  personalInfo: PersonalInfo | null;
  loading: boolean;
  error: string | null;
  setPersonalInfo: (personalInfo: PersonalInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getPersonalInfo: () => void;
  updatePersonalInfo: (personalInfo: PersonalInfoFormData) => Promise<void>;
}

const PersonalInfoContext = createContext<PersonalInfoContextType | null>(null);

export const PersonalInfoProvider = ({ children }: { children: ReactNode }) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL 
  const getPersonalInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/personal-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch personal info');
      setPersonalInfo(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Load personal info when user is authenticated and auth loading is complete
  useEffect(() => {
    if (user && !authLoading) {
      getPersonalInfo();
    } else if (!authLoading && !user) {
      // If auth is complete but no user, set loading to false
      setLoading(false);
    }
  }, [user, authLoading, getPersonalInfo]);

  

  const updatePersonalInfo = async (personalInfo: PersonalInfoFormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/personal-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(personalInfo),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update personal info');
      setPersonalInfo(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PersonalInfoContext.Provider value={{ 
      personalInfo, 
      loading, 
      error, 
      setPersonalInfo, 
      setLoading, 
      setError, 
      getPersonalInfo,
      updatePersonalInfo 
    }}>
      {children}
    </PersonalInfoContext.Provider>
  );
}

export const usePersonalInfo = () => {
  const context = useContext(PersonalInfoContext);
  if (!context) {
    throw new Error('usePersonalInfo must be used within a PersonalInfoProvider');
  }
  return context;
}