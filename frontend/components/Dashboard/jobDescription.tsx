"use client";

import React, { useState, useEffect } from "react";
import { useResume } from '@/context/resumeProvider';


export default function JobDescription() {
  const [content, setContent] = useState("");
  const [shouldGenerateResume, setShouldGenerateResume] = useState(false);
  const { generateResume, parseJobDescription, isLoading, error, jobDescription, generatedResumeContent } = useResume();

  // Effect to generate resume when job description is parsed
  useEffect(() => {
    if (shouldGenerateResume && jobDescription && typeof jobDescription === 'object' && 'id' in jobDescription) {
        const generateResumeFunction = async () => {
            await generateResume(jobDescription.id as string);
        }
        generateResumeFunction();
        console.log('generatedResumeContent', generatedResumeContent);
      setShouldGenerateResume(false);
    }
  }, [jobDescription, shouldGenerateResume, generateResume, generatedResumeContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      // First parse the job description
      await parseJobDescription(content);
      // Set flag to generate resume once job description is parsed
      setShouldGenerateResume(true);
    } catch (error) {
      console.error('Error processing job description:', error);
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 px-3 py-3 bg-transparent text-gray-800 placeholder-gray-500 resize-none focus:outline-none min-h-[44px] max-h-32"
            placeholder="Paste job description here to generate a tailored resume..."
            required
            disabled={isLoading}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="p-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center w-[44px] h-[44px] flex-shrink-0"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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