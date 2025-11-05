"use client";

import { useParams } from "next/navigation";
import { useResume } from "@/hooks/resumeProvider";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { ToastContainer, useToast } from "@/components/Ui/Toast";
import { EditableTemplateRenderer } from "@/lib/TemplateEngine";
import { ryanTemplateSpec } from "@/Templates/html/ryan";
import { ResumeData } from "@/types/resume";
import { ResumeRecordSchema } from "@/types/resume-record.schema";
import { mapRecordToTemplateData } from "@/utils/mapRecordToTemplateData";
import { DEFAULT_RESUME, transformResumeData } from "@/lib/resumeUtils";
import { downloadResumeAsPDF } from "@/lib/pdfUtils";
import { saveEditedContent, loadEditedContent, saveEditedContentImmediate, clearEditedContent } from "@/lib/storageUtils";
import Toolbar from "@/components/Dashboard/Toolbar";

import ResumeLoading from "@/components/resumeLoading";

export default function DocumentPage() {
  const { generatedResumeContent, getResume, useResumeSSE } = useResume()
  const editorRef = useRef<HTMLDivElement>(null)
  const [editedContent, setEditedContent] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [hasFetchedForStatus, setHasFetchedForStatus] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toasts, removeToast, showSuccess, showError } = useToast()
  const { id } = useParams()
  
  // Use SSE to monitor resume processing status
  const status = useResumeSSE(id as string)

  const resumeData: ResumeData = useMemo(() => {
    if (!generatedResumeContent) return DEFAULT_RESUME
    
    const parsed = ResumeRecordSchema.safeParse(generatedResumeContent)
    if (!parsed.success) {
      return DEFAULT_RESUME
    }
    const mapped = mapRecordToTemplateData(parsed.data)
  
    return mapped
  }, [generatedResumeContent])

  // Transform data for the ryan template
  const templateData = useMemo(() => {
    const transformed = transformResumeData(resumeData)
    return transformed
  }, [resumeData])

  // Save content changes when editor content changes (debounced)
  const handleContentChange = useCallback((html: string) => {
    const resumeId = (id as string) || generatedResumeContent?.id
    if (resumeId) {
      saveEditedContent(html, resumeId, debounceTimeoutRef)
    }
    setEditedContent(html)
  }, [id, generatedResumeContent?.id])

  // Check localStorage first (even before DB fetch) using the ID from URL
  useEffect(() => {
    if (id) {
      const savedContent = loadEditedContent(id as string)
      if (savedContent) {
        // Always use localStorage content if it exists, set it immediately
        setEditedContent(savedContent)
      }
    }
  }, [id])

  // Only update from localStorage when generatedResumeContent ID changes (fallback)
  useEffect(() => {
    if (generatedResumeContent?.id && generatedResumeContent.id !== id) {
      const savedContent = loadEditedContent(generatedResumeContent.id)
      if (savedContent) {
        setEditedContent(savedContent)
      } else {
        setEditedContent(null)
      }
    }
  }, [generatedResumeContent?.id, id])

  // Save content to localStorage immediately when editedContent changes (only if different from what's stored)
  useEffect(() => {
    const resumeId = (id as string) || generatedResumeContent?.id
    if (editedContent && resumeId) {
      const storedContent = loadEditedContent(resumeId)
      // Only save if content is different to avoid unnecessary writes
      if (storedContent !== editedContent) {
        saveEditedContentImmediate(editedContent, resumeId)
      }
    }
  }, [editedContent, id, generatedResumeContent?.id])

  // Cleanup timeouts on unmount
  useEffect(() => {
    const debounceTimeout = debounceTimeoutRef.current
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [])

  // Download resume as PDF
  const handleDownloadResume = useCallback(async () => {
    const resumeId = (id as string) || generatedResumeContent?.id
    await downloadResumeAsPDF(
      editorRef, 
      templateData, 
      setIsDownloading,
      () => {
        showSuccess(
          'PDF Downloaded Successfully!',
          'Your resume has been saved to your device.',
          3000
        );
        // Clear localStorage after successful download
        if (resumeId) {
          clearEditedContent(resumeId);
        }
      },
      (error) => {
        showError(
          'PDF Download Failed',
          error,
          5000
        );
      }
    )
  }, [templateData, showSuccess, showError, id, generatedResumeContent?.id])

  // Load resume when status becomes ready or on initial load
  // Skip DB fetch if localStorage has content (use localStorage content instead)
  useEffect(() => {
    const getResumeFunction = async () => {
      // Check if localStorage has content - if so, skip DB fetch
      const hasLocalStorageContent = id && loadEditedContent(id as string)
      if (hasLocalStorageContent) {
        return
      }

      // When status becomes "ready", fetch the resume once
      if (status?.status === "ready" && !hasFetchedForStatus) {
        setHasFetchedForStatus(true)
        await getResume(id as string)
      } 
      // On initial load without SSE status, try to load the resume directly
      else if (!status && !generatedResumeContent && !hasFetchedForStatus) {
        setHasFetchedForStatus(true)
        await getResume(id as string)
      }
    }
    getResumeFunction()
  }, [status, generatedResumeContent, getResume, id, hasFetchedForStatus])

  // Reset fetch flag when status changes to processing (for re-generation scenarios)
  useEffect(() => {
    if (status?.status === "processing") {
      setHasFetchedForStatus(false)
    }
  }, [status?.status])

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200"
              style={{ left: 'var(--sidebar-width, 64px)' }}>
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="overflow-x-auto">
            <Toolbar editorRef={editorRef} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-28 sm:pt-24 pb-32 relative z-10">
        {/* Show error state if processing failed */}
        {status?.status === "failed" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Resume Generation Failed</h2>
              <p className="text-gray-600 mb-4">{status?.errorMessage || "Something went wrong while generating your resume."}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Show loading or content */}
        {!status?.status || status?.status !== "failed" ? (
          <div className="mt-6">
            { ((status?.status === "ready" && generatedResumeContent) || editedContent) ? 
            <>
              <div className="flex justify-center mb-6 mt-16 sm:mt-6">
                <button
                  onClick={handleDownloadResume}
                  disabled={isDownloading}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${
                    isDownloading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                  } text-white`}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Resume PDF
                    </>
                  )}
                </button>
              </div>
              <EditableTemplateRenderer
              ref={editorRef}
              spec={ryanTemplateSpec}
              data={templateData}
              initialContent={editedContent}
              onContentChange={handleContentChange}
              className="resume-editor"
            /> </> : <ResumeLoading message={status?.status === "processing" ? "tailoring" : "loading"} />}
          </div>
        ) : null}
      </main>

    
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
