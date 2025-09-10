"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface GeneratedResume {
  id?: string;
  content?: string;
  [key: string]: unknown;
}

interface JobDescription {
  id: string;
  content: string;
  parsedData: Record<string, unknown>;
  createdAt: string;
  userId: string;
}

interface ResumeContextType {
  resume: File | null;
  setResume: (resume: File | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  jobDescription: JobDescription | null;
  setJobDescription: (jobDescription: JobDescription | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  generatedResumeContent: GeneratedResume | null;
  setGeneratedResumeContent: (generatedResumeContent: GeneratedResume | null) => void;
  parseJobDescription: (jobDescription: string) => Promise<void>;
  generateResume: (jobDescriptionId: string) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | null>(null);



export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const [resume, setResume] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatedResumeContent, setGeneratedResumeContent] = useState<GeneratedResume | null>(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


    const parseJobDescription = async (jobDescription: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/job-description`, {
                method: 'POST',
                body: JSON.stringify({ content: jobDescription }),
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.jobDescription) {
                setJobDescription(data.jobDescription);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Parse job description error:', err);
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    const generateResume = async (jobDescriptionId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            
            const response = await fetch(`${API_BASE_URL}/api/resumes`, {
                method: 'POST',
                body: JSON.stringify({ jobDescriptionId }),
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resume generation error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.resume) {
                setGeneratedResumeContent(data.resume);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Generate resume error:', err);
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <ResumeContext.Provider 
            value={{ 
                resume, 
                setResume, 
                isLoading, 
                setIsLoading, 
                jobDescription, 
                setJobDescription, 
                error, 
                setError, 
                setGeneratedResumeContent, 
                generatedResumeContent, 
                parseJobDescription, 
                generateResume 
            }}
        >
            {children}
        </ResumeContext.Provider>
    )
}

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
}