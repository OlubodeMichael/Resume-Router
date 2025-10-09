"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResume } from '@/context/resumeProvider';


export default function JobDescription() {
  const [content, setContent] = useState("");
  const [shouldGenerateResume, setShouldGenerateResume] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { parseJobDescription, getResume, isLoading, error, jobDescription, generatedResumeContent, setGeneratedResumeContent } = useResume();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      // Clear any existing resume content before starting new generation
      setGeneratedResumeContent(null);
      
      // First parse the job description
      await parseJobDescription(content);
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

  return (
    <div className="">
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm mb-4">
          {error}
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
            disabled={!content.trim() || isLoading}
            className={`${
              isLoading ? 'px-4 w-auto' : 'w-[44px]'
            } p-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 h-[44px] flex-shrink-0`}
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
    </div>
  );
}