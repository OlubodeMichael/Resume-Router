"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResume } from '@/hooks/resumeProvider';
import { useProfile } from '@/hooks/profileProvider';
import { useAuth } from '@/hooks/authProvider';
import { hasProfileData, getProfileValidationMessage } from '@/utils/profileValidation';
import UpgradePrompt from '@/components/UpgradePrompt';


export default function JobDescription() {
  const [content, setContent] = useState("");
  const [shouldGenerateResume, setShouldGenerateResume] = useState(false);
  const [profileWarning, setProfileWarning] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { parseJobDescription, getResume, isLoading, error, jobDescription, generatedResumeContent, setGeneratedResumeContent, showUpgradePrompt, setShowUpgradePrompt, showError } = useResume();
  const { profile, loading: profileLoading } = useProfile();
  const { refreshCredits } = useAuth();

  // Effect to get resume when job description is parsed
  useEffect(() => {
    if (shouldGenerateResume && jobDescription && typeof jobDescription === 'object' && 'resumeId' in jobDescription) {
        const getResumeFunction = async () => {
            await getResume(jobDescription.resumeId as string);
        }
        getResumeFunction();
        setShouldGenerateResume(false);
        
        // Redirect to the documents page with the resumeId
        router.push(`/dashboard/documents/${jobDescription.resumeId}`);
    }
  }, [jobDescription, shouldGenerateResume, getResume, router]);
  // Effect to log retrieved content when it's available and clear the form
  useEffect(() => {
    if (generatedResumeContent) {
      setContent("");
      setShouldGenerateResume(false);
    }
  }, [generatedResumeContent]);

  // Effect to reset textarea height when content is cleared
  useEffect(() => {
    if (!content && textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  }, [content]);

  // Check profile data when profile loads
  useEffect(() => {
    if (!profileLoading) {
      if (!hasProfileData(profile)) {
        setProfileWarning(getProfileValidationMessage(profile));
      } else {
        setProfileWarning(null);
      }
    }
  }, [profile, profileLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Validate profile data before proceeding
    if (!hasProfileData(profile)) {
      const message = getProfileValidationMessage(profile);
      setProfileWarning(message);
      showError(
        'Profile Incomplete',
        message + ' Visit your profile page to add information.',
        6000
      );
      return;
    }

    try {
      // Clear any existing resume content and warnings before starting new generation
      setGeneratedResumeContent(null);
      setProfileWarning(null);
      
      // First parse the job description (credits are deducted here)
      await parseJobDescription(content);
      
      // Refresh credits immediately after successful job description parsing
      // Credits are deducted when the job description is created via requireEntitlement middleware
      await refreshCredits();
      
      // Set flag to generate resume once job description is parsed
      setShouldGenerateResume(true);
    } catch (error) {
      console.error('Error processing job description:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && content.trim()) {
        // Create a synthetic form event for handleSubmit
        const syntheticEvent = {
          ...e,
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation(),
          target: e.target,
          currentTarget: e.currentTarget,
        } as React.FormEvent;
        handleSubmit(syntheticEvent);
      }
    }
  };

  const isProfileEmpty = !profileLoading && !hasProfileData(profile);
  const isSubmitDisabled = !content.trim() || isLoading || isProfileEmpty;

  return (
    <div className="">
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}
      
      {profileWarning && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium mb-1">Profile Incomplete</p>
              <p className="text-amber-700">{profileWarning}</p>
              <a 
                href="dashboard/profile" 
                className="text-amber-900 font-medium underline hover:text-amber-950 mt-1 inline-block"
              >
                Go to Profile →
              </a>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-gray-300 focus-within:shadow-sm transition-all duration-200 p-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-3 bg-transparent text-gray-800 placeholder-gray-500 resize-none focus:outline-none min-h-[44px] max-h-40"
            placeholder="Paste job description here to generate a tailored resume..."
            required
            disabled={isLoading}
            rows={1}
            style={{ height: '44px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '44px'; // Reset to normal height
              target.style.height = Math.min(target.scrollHeight, 160) + 'px'; // Expand up to max-h-40 (160px)
            }}
          />
          
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`${
              isLoading ? 'px-4 w-auto' : 'w-[44px]'
            } p-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 h-[44px] flex-shrink-0`}
            title={isProfileEmpty ? "Complete your profile first" : ""}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm whitespace-nowrap">Parsing...</span>
              </>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
      
      {/* Upgrade Prompt */}
      <UpgradePrompt 
        show={showUpgradePrompt} 
        onClose={() => setShowUpgradePrompt(false)} 
      />
    </div>
  );
}