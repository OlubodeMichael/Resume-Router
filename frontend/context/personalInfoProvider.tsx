"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  jobTitle: string;
  pronouns: string;
}

interface PersonalInfoContextType {
  personalInfo: PersonalInfo | null;
  loading: boolean;
  error: string | null;
  setPersonalInfo: (personalInfo: PersonalInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getPersonalInfo: () => void;
  updatePersonalInfo: (personalInfo: PersonalInfo) => Promise<void>;
}

const PersonalInfoContext = createContext<PersonalInfoContextType | null>(null);

export const PersonalInfoProvider = ({ children }: { children: ReactNode }) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  // Load personal info when component mounts
  useEffect(() => {
    getPersonalInfo();
  }, [getPersonalInfo]);

  

  const updatePersonalInfo = async (personalInfo: PersonalInfo) => {
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