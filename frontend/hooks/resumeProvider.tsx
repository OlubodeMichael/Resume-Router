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
  deleteResume: (resumeId: string) => Promise<void>;
  resumes: GeneratedResume[];
  setGeneratedResumeContent: (generatedResumeContent: GeneratedResume | null) => void;
  parseJobDescription: (jobDescription: string) => Promise<void>;
  generateResume: (jobDescriptionId: string) => Promise<void>;
  showUpgradePrompt: boolean;
  setShowUpgradePrompt: (show: boolean) => void;
  parseResumeFile: (file: File) => Promise<ParsedResumeResult | null>;
  isParsingResume: boolean;
  lastParsedResume: ParsedResumeResult | null;
  showError: (title: string, message: string, duration?: number) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  rewriteSection: (resumeId: string, sectionType: string, content: string, customPrompt?: string) => Promise<{ rewrittenContent: string; creditCost: number }>;
}

export type ParsedResumeResult = {
  message: string;
  data: Record<string, unknown>;
  mapped?: {
    appliedSections: string[];
    warnings: string[];
    profileUpdated: boolean;
  };
};

const ResumeContext = createContext<ResumeContextType | null>(null);



export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const [resume, setResume] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isParsingResume, setIsParsingResume] = useState<boolean>(false);
    const [resumes, setResumes] = useState<GeneratedResume[]>([]);
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState<boolean>(false);
    const [status, setStatus] = useState<Status | null>(null);
    const [generatedResumeContent, setGeneratedResumeContent] = useState<GeneratedResume | null>(null);
    const [lastParsedResume, setLastParsedResume] = useState<ParsedResumeResult | null>(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
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
                const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
                console.error('Error response:', errorData);
                
                // Check if it's an insufficient credits error
                if (response.status === 402 && errorData.error === 'insufficient_credits') {
                    setShowUpgradePrompt(true);
                    setError(null); // Clear any existing error
                    return;
                }
                
                // Check if it's a profile incomplete error
                if (response.status === 400 && errorData.error === 'profile_incomplete') {
                    showError(
                        'Profile Incomplete',
                        errorData.message || 'Please complete your profile before generating a resume.',
                        6000
                    );
                    setError(errorData.message || 'Profile incomplete');
                    return;
                }
                
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
                
                // Credits are deducted when job description is created, refresh immediately
                // Import useAuth hook to get refreshCredits - but we can't use hooks here
                // So we'll handle it in the component that calls this
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

    const parseResumeFile = async (file: File): Promise<ParsedResumeResult | null> => {
        setIsParsingResume(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("resume", file);

            const response = await fetch(`${API_BASE_URL}/api/resumes/parse`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to parse resume" }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as ParsedResumeResult;
            setLastParsedResume(data);

            if (data.mapped?.profileUpdated) {
                showSuccess(
                    "Resume Parsed & Profile Updated",
                    data.mapped.appliedSections.length
                        ? `Updated sections: ${data.mapped.appliedSections.join(", ")}`
                        : "Your profile has been refreshed with resume data.",
                    5000
                );
            } else {
                showSuccess(
                    "Resume Parsed Successfully",
                    "Review the extracted data and warnings if any.",
                    5000
                );
            }

            if (data.mapped?.warnings?.length) {
                data.mapped.warnings.forEach((warning) => {
                    showError("Resume Import Warning", warning, 6000);
                });
            }

            return data;
        } catch (err) {
            const message = (err as Error).message || "Failed to parse resume.";
            setError(message);
            showError("Resume Parsing Failed", message, 6000);
            return null;
        } finally {
            setIsParsingResume(false);
        }
    };

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
            //console.log('Get resumes data:', data);
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

    const deleteResume = async (resumeId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete resume error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Delete resume response:', data);
            
            // Remove the deleted resume from the resumes array
            setResumes(prevResumes => prevResumes.filter(resume => resume.id !== resumeId));
            
            showSuccess(
                'Resume Deleted Successfully!',
                'Your resume has been permanently deleted.',
                3000
            );
        } catch (err) {
            console.error('Delete resume error:', err);
            setError((err as Error).message);
            showError(
                'Failed to Delete Resume',
                (err as Error).message || 'Please try again later.',
                5000
            );
        } finally {
            setIsLoading(false);
        }
    }

    const rewriteSection = async (
        resumeId: string,
        sectionType: string,
        content: string,
        customPrompt?: string
    ): Promise<{ rewrittenContent: string; creditCost: number }> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/rewrite-section`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    sectionType,
                    content,
                    tone: 'professional',
                    customPrompt: customPrompt,
                }),
            });
            
            if (!response.ok) {
                // Try to get the response as text first to handle both JSON and HTML responses
                const contentType = response.headers.get('content-type');
                let errorData: { message?: string; error?: string } = {};
                let errorText = '';
                
                try {
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                    } else {
                        errorText = await response.text();
                        console.error('Non-JSON error response:', errorText);
                        // Try to parse as JSON anyway, but use text as fallback
                        try {
                            errorData = JSON.parse(errorText);
                        } catch {
                            // If it's HTML or other non-JSON, extract meaningful message
                            if (errorText.includes('Cannot POST') || errorText.includes('404')) {
                                throw new Error('Route not found. The server may need to be restarted or the route is not configured.');
                            }
                            errorData = { message: errorText || 'Request failed' };
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    errorData = { message: errorText || `HTTP error! status: ${response.status}` };
                }
                
                console.error('Rewrite section error response:', { status: response.status, errorData, errorText });
                
                // Check if it's an insufficient credits error
                if (response.status === 402 && errorData.error === 'insufficient_credits') {
                    setShowUpgradePrompt(true);
                    setError(null); // Clear any existing error
                    throw new Error('Insufficient Credits');
                }
                
                // Handle authentication errors
                if (response.status === 401) {
                    throw new Error(errorData.message || 'Authentication Required');
                }
                
                // Handle 404 - route not found
                if (response.status === 404) {
                    throw new Error(errorData.message || 'Route not found. Please check if the server is running correctly.');
                }
                
                throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.rewrittenContent) {
                throw new Error('No rewritten content received from server');
            }

            return {
                rewrittenContent: data.rewrittenContent,
                creditCost: data.creditCost || 2,
            };
        } catch (err) {
            console.error('Rewrite section error:', err);
            const errorMessage = (err as Error).message || 'Failed to rewrite section. Please try again.';
            setError(errorMessage);
            showError(
                'Section Rewrite Failed',
                errorMessage,
                5000
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

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
                generateResume,
                deleteResume,
                showUpgradePrompt,
                setShowUpgradePrompt,
                parseResumeFile,
                isParsingResume,
                lastParsedResume,
                showError,
                showSuccess,
                rewriteSection
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