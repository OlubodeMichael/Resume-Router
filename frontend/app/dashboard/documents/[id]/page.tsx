"use client";

import { useParams } from "next/navigation";
import { useResume } from "@/hooks/resumeProvider";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { ToastContainer, useToast } from "@/components/Ui/Toast";
import { EditableTemplateRenderer } from "@/lib/TemplateEngine";
import { ryanTemplateSpec } from "@/Templates/html/ryan";
import { ResumeData } from "@/types/resume";
import { ResumeRecordSchema } from "@/types/resume-record.schema";
import type { ResumeRecord } from "@/types/resume-record.schema";
import { mapRecordToTemplateData } from "@/utils/mapRecordToTemplateData";
import { DEFAULT_RESUME, transformResumeData } from "@/lib/resumeUtils";
import { downloadResumeAsPDF } from "@/lib/pdfUtils";
import { saveEditedContent, loadEditedContent, saveEditedContentImmediate, clearEditedContent } from "@/lib/storageUtils";
import { updateJsonFromHtml } from "@/lib/htmlToJsonConverter";
import Toolbar from "@/components/Dashboard/Toolbar";
import SectionReorderSidebar from "@/components/Dashboard/SectionReorderSidebar";

import ResumeLoading from "@/components/resumeLoading";

export default function DocumentPage() {
  const { generatedResumeContent, getResume, useResumeSSE } = useResume()
  const editorRef = useRef<HTMLDivElement>(null)
  const [editedContent, setEditedContent] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [hasFetchedForStatus, setHasFetchedForStatus] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reorderSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handleSaveToDBRef = useRef<((options?: { silent?: boolean }) => Promise<void>) | null>(null)
  const { toasts, removeToast, showSuccess, showError } = useToast()
  const { id } = useParams()
  
  // Use SSE to monitor resume processing status
  const status = useResumeSSE(id as string)

  const normalizedResumeRecord = useMemo(() => {
    if (!generatedResumeContent) return null

    if (
      generatedResumeContent.content &&
      typeof generatedResumeContent.content === "string"
    ) {
      try {
        const parsedContent = JSON.parse(generatedResumeContent.content)
        return {
          ...generatedResumeContent,
          content: parsedContent,
        }
      } catch (error) {
        console.warn("Failed to parse resume content string", error)
        return generatedResumeContent
      }
    }

    return generatedResumeContent
  }, [generatedResumeContent])

  const hasResumeContent = useMemo(() => {
    if (
      !normalizedResumeRecord ||
      !normalizedResumeRecord.content ||
      typeof normalizedResumeRecord.content !== "object" ||
      Array.isArray(normalizedResumeRecord.content)
    ) {
      return false
    }
    return Object.keys(normalizedResumeRecord.content as Record<string, unknown>).length > 0
  }, [normalizedResumeRecord])

  const resumeData: ResumeData = useMemo(() => {
    if (!normalizedResumeRecord || !hasResumeContent) return DEFAULT_RESUME

    const parsed = ResumeRecordSchema.safeParse(normalizedResumeRecord)
    if (!parsed.success) {
      console.warn("Failed to parse resume record", parsed.error)
      if (
        normalizedResumeRecord &&
        typeof normalizedResumeRecord === "object" &&
        normalizedResumeRecord !== null &&
        "content" in normalizedResumeRecord &&
        normalizedResumeRecord.content &&
        typeof normalizedResumeRecord.content === "object"
      ) {
        try {
          return mapRecordToTemplateData({
            id: (normalizedResumeRecord as { id?: string }).id ?? crypto.randomUUID?.() ?? "00000000-0000-0000-0000-000000000000",
            userId: (normalizedResumeRecord as { userId?: string }).userId ?? "00000000-0000-0000-0000-000000000000",
            jobDescriptionId:
              (normalizedResumeRecord as { jobDescriptionId?: string }).jobDescriptionId ??
              "00000000-0000-0000-0000-000000000000",
            content: normalizedResumeRecord.content as ResumeRecord["content"],
          })
        } catch (error) {
          console.warn("Failed to map resume content fallback", error)
        }
      }

      return DEFAULT_RESUME
    }

    return mapRecordToTemplateData(parsed.data)
  }, [normalizedResumeRecord, hasResumeContent])

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
      setHasUnsavedChanges(true) // Mark that there are unsaved changes
    }
    setEditedContent(html)
  }, [id, generatedResumeContent?.id])

  const handleSectionsReordered = useCallback((html: string) => {
    handleContentChange(html)
    if (reorderSaveTimeoutRef.current) {
      clearTimeout(reorderSaveTimeoutRef.current)
    }
    reorderSaveTimeoutRef.current = setTimeout(() => {
      handleSaveToDBRef.current?.({ silent: true })
      reorderSaveTimeoutRef.current = null
    }, 800)
  }, [handleContentChange])
  // Save JSON to database manually - converts HTML edits to JSON first
  const handleSaveToDB = useCallback(async ({ silent }: { silent?: boolean } = {}) => {
    const resumeId = (id as string) || generatedResumeContent?.id
    if (!resumeId || !generatedResumeContent?.content || isSaving) return;

    try {
      setIsSaving(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Get current HTML from editor
      const currentHtml = editorRef.current?.innerHTML || editedContent || '';
      
      // Convert HTML edits to JSON (preserving styling)
      let updatedJson: Record<string, unknown>;
      if (currentHtml && generatedResumeContent.content && typeof generatedResumeContent.content === 'object' && !Array.isArray(generatedResumeContent.content)) {
        // Parse HTML and update JSON - preserves styling (HTML strings in JSON fields)
        console.log('Converting HTML to JSON...', { 
          currentHtmlLength: currentHtml.length,
          hasStyling: currentHtml.includes('<strong') || currentHtml.includes('<em') || currentHtml.includes('style=')
        });
        updatedJson = updateJsonFromHtml(currentHtml, generatedResumeContent.content as Record<string, unknown>);
        const headerName = (updatedJson.header as Record<string, unknown>)?.name;
        const experience = updatedJson.experience as Array<Record<string, unknown>> | undefined;
        const sampleExp = experience?.[0]?.responsibilities as string[] | undefined;
        const categorizedSkills = updatedJson.categorizedSkills as {
          languages?: string[];
          librariesFrameworks?: string[];
          developerTools?: string[];
        } | undefined;
        console.log('Updated JSON with styling:', {
          headerName,
          sampleExperience: sampleExp?.[0],
          hasHtmlInJson: JSON.stringify(updatedJson).includes('<strong') || JSON.stringify(updatedJson).includes('<em') || JSON.stringify(updatedJson).includes('<span'),
          experienceCount: Array.isArray(updatedJson.experience) ? updatedJson.experience.length : 0,
          projectsCount: Array.isArray(updatedJson.projects) ? updatedJson.projects.length : 0,
          educationCount: Array.isArray(updatedJson.education) ? updatedJson.education.length : 0,
          categorizedSkills: categorizedSkills ? {
            languagesCount: categorizedSkills.languages?.length || 0,
            librariesCount: categorizedSkills.librariesFrameworks?.length || 0,
            toolsCount: categorizedSkills.developerTools?.length || 0,
          } : null,
        });
      } else {
        // Fallback to existing content if no HTML edits or invalid content type
        if (generatedResumeContent.content && typeof generatedResumeContent.content === 'object') {
          updatedJson = generatedResumeContent.content as Record<string, unknown>;
          console.log('Using existing JSON (no HTML edits detected)');
        } else {
          throw new Error('Invalid resume content format');
        }
      }
      
      const requestBody = { 
        content: updatedJson, // Save updated JSON with styling preserved as HTML strings
        lastEditedAt: Date.now()
      };
      
      console.log('Saving to DB:', { 
        resumeId, 
        contentKeys: Object.keys(updatedJson),
        hasStylingInContent: JSON.stringify(requestBody.content).includes('<')
      });
      
      const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setHasUnsavedChanges(false);
      if (!silent) {
        showSuccess(
          'Resume Saved Successfully!',
          'Your changes with styling have been saved to the database.',
          3000
        );
      }
    } catch (error) {
      console.error('Failed to save resume:', error);
      showError(
        'Save Failed',
        (error as Error).message || 'Failed to save resume. Please try again.',
        5000
      );
    } finally {
      setIsSaving(false);
    }
  }, [id, generatedResumeContent?.id, generatedResumeContent?.content, editedContent, isSaving, showSuccess, showError])

  useEffect(() => {
    handleSaveToDBRef.current = handleSaveToDB;
  }, [handleSaveToDB])

  useEffect(() => {
    return () => {
      if (reorderSaveTimeoutRef.current) {
        clearTimeout(reorderSaveTimeoutRef.current)
      }
    }
  }, [])

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
  useEffect(() => {
    const resumeId = id as string | undefined
    if (!resumeId) return

    const run = async () => {
      if (status?.status === "ready" && !hasFetchedForStatus) {
        setHasFetchedForStatus(true)
        await getResume(resumeId)
        return
      }

      if (!status && !generatedResumeContent && !hasFetchedForStatus) {
        setHasFetchedForStatus(true)
        await getResume(resumeId)
      }
    }

    const localContent = loadEditedContent(resumeId)
    if (!localContent || status?.status === "ready") {
      void run()
    }
  }, [status, generatedResumeContent, getResume, id, hasFetchedForStatus])

  useEffect(() => {
    if (status?.status === "processing") {
      const resumeId = (id as string) || generatedResumeContent?.id
      if (resumeId) {
        clearEditedContent(resumeId)
      }
      setEditedContent(null)
      setHasUnsavedChanges(false)
    }
  }, [status?.status, id, generatedResumeContent?.id])

  // Reset fetch flag when status changes to processing (for re-generation scenarios)
  useEffect(() => {
    if (status?.status === "processing") {
      setHasFetchedForStatus(false)
    }
  }, [status?.status])

  const isFailed = status?.status === "failed";
  const shouldRenderEditor =
    (status?.status === "ready" && hasResumeContent) ||
    (!!editedContent && status?.status !== "processing");

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200"
              style={{ left: 'var(--sidebar-width, 64px)' }}>
        <div className="mx-auto max-w-none px-4 py-3">
          <div className="overflow-x-auto">
            <Toolbar editorRef={editorRef} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-none pt-28 sm:pt-24 pb-32 relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1">
            {isFailed ? (
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
            ) : (
              <div className="mt-6">
                {shouldRenderEditor ? (
                  <>
                    <div className="flex justify-center gap-4 mb-6 mt-16 sm:mt-6">
                      {hasUnsavedChanges && (
                        <button
                          onClick={() => handleSaveToDB()}
                          disabled={isSaving}
                          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${
                            isSaving 
                              ? 'bg-gray-400 cursor-not-allowed text-white' 
                              : 'bg-green-600 hover:bg-green-700 hover:shadow-xl text-white'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      )}
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
                    />
                  </>
                ) : (
                  <ResumeLoading message={status?.status === "processing" ? "tailoring" : "loading"} />
                )}
              </div>
            )}
          </div>

          <SectionReorderSidebar editorRef={editorRef} onReorder={handleSectionsReordered} />
        </div>
      </main>

    
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
