"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/authProvider";
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
  const { loading } = useAuth()
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
  console.log('status', status?.status)

  const resumeData: ResumeData = useMemo(() => {
    if (!generatedResumeContent) return DEFAULT_RESUME
    
    const parsed = ResumeRecordSchema.safeParse(generatedResumeContent)
    if (!parsed.success) {
      console.warn('Invalid resume payload', parsed.error)
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
    saveEditedContent(html, generatedResumeContent?.id, debounceTimeoutRef)
  }, [generatedResumeContent?.id])

  // Reset edited content when new resume is generated and clear localStorage
  useEffect(() => {
    if (generatedResumeContent) {
      setEditedContent(null)
      // Clear localStorage when a new resume is generated
      clearEditedContent(generatedResumeContent.id)
    }
  }, [generatedResumeContent])

  // Save content to localStorage for persistence across page refreshes
  useEffect(() => {
    if (editedContent && generatedResumeContent?.id) {
      saveEditedContentImmediate(editedContent, generatedResumeContent.id)
    }
  }, [editedContent, generatedResumeContent?.id])

  // Load edited content from localStorage on mount
  useEffect(() => {
    if (generatedResumeContent?.id) {
      const savedContent = loadEditedContent(generatedResumeContent.id)
      if (savedContent) {
        setEditedContent(savedContent)
      }
    }
  }, [generatedResumeContent?.id])

  // Download resume as PDF
  const handleDownloadResume = useCallback(async () => {
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
        clearEditedContent(generatedResumeContent?.id);
      },
      (error) => {
        showError(
          'PDF Download Failed',
          error,
          5000
        );
      }
    )
  }, [templateData, showSuccess, showError, generatedResumeContent?.id])

  // Load resume when status becomes ready or on initial load
  useEffect(() => {
    const getResumeFunction = async () => {
      // When status becomes "ready", fetch the resume once
      if (status?.status === "ready" && !hasFetchedForStatus) {
        console.log('status is ready, fetching resume...')
        setHasFetchedForStatus(true)
        await getResume(id as string)
      } 
      // On initial load without SSE status, try to load the resume directly
      else if (!status && !generatedResumeContent && !hasFetchedForStatus) {
        console.log('no status yet, trying to load resume...')
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }


  // Show error state if processing failed
  if (status?.status === "failed") {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
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
    )
  }

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
        

        <div className="mt-6">
          { (status?.status === "ready" && generatedResumeContent) ? 
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
          /> </> : <ResumeLoading />}
        </div>
      </main>

    
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
