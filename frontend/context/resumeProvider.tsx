"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast, ToastContainer } from '@/components/Ui/Toast';

interface GeneratedResume {
  id?: string;
  content?: string;
  [key: string]: unknown;
}
type Status = { status: "processing"|"ready"|"failed"; errorMessage?: string|null };

interface JobDescription {
  jobDescriptionId: string;
  message: string;
  resumeId: string;
  status: string;
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
  useResumeSSE: (resumeId: string) => Status | null;
  status: Status | null;
  getResume: (resumeId: string, showToast?: boolean) => Promise<void>;
  getResumes: () => Promise<void>;
  resumes: GeneratedResume[];
  setGeneratedResumeContent: (generatedResumeContent: GeneratedResume | null) => void;
  parseJobDescription: (jobDescription: string) => Promise<void>;
  generateResume: (jobDescriptionId: string) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | null>(null);



export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const [resume, setResume] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resumes, setResumes] = useState<GeneratedResume[]>([]);
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status | null>(null);
    const [generatedResumeContent, setGeneratedResumeContent] = useState<GeneratedResume | null>(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const { toasts, removeToast, showSuccess, showError } = useToast();


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
            console.log('Parse job description data:', data);
            
            if (data.jobDescriptionId && data.resumeId && data.status) {
                setJobDescription({
                    jobDescriptionId: data.jobDescriptionId,
                    message: data.message,
                    resumeId: data.resumeId,
                    status: data.status
                });
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
                showSuccess(
                    'Resume Generated Successfully!',
                    'Your personalized resume is ready for download.',
                    5000
                );
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Generate resume error:', err);
            setError((err as Error).message);
            showError(
                'Resume Generation Failed',
                (err as Error).message || 'Please try again later.',
                5000
            );
        } finally {
            setIsLoading(false);
        }
    }

    const getResume = async (resumeId: string, showToast: boolean = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Get resume error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            //console.log('Get resume data:', data);
            
            if (data.resume) {
                setGeneratedResumeContent(data.resume);
                if (showToast) {
                    showSuccess(
                        'Resume Retrieved Successfully!',
                        'Your resume has been loaded.',
                        3000
                    );
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Get resume error:', err);
            setError((err as Error).message);
            showError(
                'Failed to Retrieve Resume',
                (err as Error).message || 'Please try again later.',
                5000
            );
        } finally {
            setIsLoading(false);
        }
    }

    const getResumes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/resumes`, {
                credentials: 'include',
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Get resumes error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Get resumes data:', data);
            setResumes(data.resumes);
        } catch (err) {
            console.error('Get resumes error:', err);
            setError((err as Error).message);
            showError(
                'Failed to Retrieve Resumes',
                (err as Error).message || 'Please try again later.',
                5000
            );
        } finally {
            setIsLoading(false);
        }
    }

    const useResumeSSE = (resumeId: string) => {
        useEffect(() => {
            if (!resumeId) return;
            const es = new EventSource(`${API_BASE_URL}/api/resumes/${resumeId}/stream`, { withCredentials: true });
        
            const onStatus = (e: MessageEvent) => setStatus(JSON.parse(e.data));
            const onError = () => es.close();
        
            es.addEventListener("status", onStatus);
            es.addEventListener("error", onError);
        
            return () => {
              es.removeEventListener("status", onStatus);
              es.removeEventListener("error", onError);
              es.close();
            };
          }, [resumeId]);
        
          return status;
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
                useResumeSSE,
                status,
                getResume,
                getResumes,
                resumes,
                setError, 
                setGeneratedResumeContent, 
                generatedResumeContent, 
                parseJobDescription, 
                generateResume 
            }}
        >
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
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