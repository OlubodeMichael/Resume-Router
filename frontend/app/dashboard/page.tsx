// app/dashboard/page.tsx
'use client'

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/authProvider'
import { useResume } from '@/context/resumeProvider'
import Toolbar from '@/components/Dashboard/Toolbar'
import Ryan from '@/components/Templates/Ryan'
import JobDescription from '@/components/Dashboard/jobDescription'
import type { ResumeData } from '@/types/resume'
import { ResumeRecordSchema } from '@/types/resume-record.schema'
import { mapRecordToTemplateData } from '@/utils/mapRecordToTemplateData'


const DEFAULT_RESUME: ResumeData = {
  name: 'Your Name',
  contacts: [],
  education: [],
  experience: [],
  projects: [],
  skills: [],
  summaryHTML: undefined,
}

export default function Dashboard() {
  const { loading } = useAuth()
  const { generatedResumeContent } = useResume()   // this is your backend JSON
  const editorRef = useRef<HTMLDivElement>(null)
  const [editedContent, setEditedContent] = useState<string | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resumeData: ResumeData = useMemo(() => {
    if (!generatedResumeContent) return DEFAULT_RESUME
    
    const parsed = ResumeRecordSchema.safeParse(generatedResumeContent)
    if (!parsed.success) {
      console.warn('Invalid resume payload', parsed.error)
      return DEFAULT_RESUME
    }
    return mapRecordToTemplateData(parsed.data)
  }, [generatedResumeContent])

  // Save content changes when editor content changes (debounced)
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      
      // Set new timeout to save content without changing rendering mode
      debounceTimeoutRef.current = setTimeout(() => {
        if (editorRef.current) {
          // Save content to localStorage without changing rendering mode
          const content = editorRef.current.innerHTML
          if (generatedResumeContent?.id) {
            localStorage.setItem(`resume-edited-content-${generatedResumeContent.id}`, content)
          }
        }
      }, 1000) // 1 second delay
    }
  }, [generatedResumeContent?.id])

  // Reset edited content when new resume is generated
  useEffect(() => {
    if (generatedResumeContent) {
      setEditedContent(null)
    }
  }, [generatedResumeContent])

  // Save content to localStorage for persistence across page refreshes
  useEffect(() => {
    if (editedContent && generatedResumeContent?.id) {
      localStorage.setItem(`resume-edited-content-${generatedResumeContent.id}`, editedContent)
    }
  }, [editedContent, generatedResumeContent?.id])

  // Load edited content from localStorage on mount
  useEffect(() => {
    if (generatedResumeContent?.id) {
      const savedContent = localStorage.getItem(`resume-edited-content-${generatedResumeContent.id}`)
      if (savedContent) {
        setEditedContent(savedContent)
      }
    }
  }, [generatedResumeContent?.id])

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

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-32 relative z-10">
        <div className="mt-6">
          <Ryan 
            data={resumeData} 
            editorRef={editorRef} 
            editedContent={editedContent}
            onContentChange={handleContentChange}
          />
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 z-40 bg-gray-50"
              style={{ left: 'var(--sidebar-width, 64px)' }}>
        <div className="mx-auto max-w-4xl p-4">
          <JobDescription />
        </div>
      </footer>
    </div>
  )
}
