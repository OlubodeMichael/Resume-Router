'use client';

//import { Square} from 'lucide-react';
import { useAuth } from '@/context/authProvider';
import Toolbar from '@/components/Dashboard/Toolbar';
import { useRef } from 'react';
import Ryan from '@/components/Templates/Ryan';
import type { ResumeData } from '@/types/resume';
import JobDescription from '@/components/Dashboard/jobDescription';


export default function Dashboard() {
  const { loading } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);

  const data: ResumeData = {
    name: 'Michael Olubode',
    contacts: ['123-456-7890', 'jake@swu.edu', 'linkedin.com/in/jake', 'github.com/jake'],
    education: [
      {
        school: 'Southwestern University',
        degree: 'Bachelor of Arts in Computer Science, Minor in Business',
        location: 'Georgetown, TX',
        start: 'Aug. 2018',
        end: 'May 2021',
      },
    ],
    experience: [
      {
        title: 'Undergraduate Research Assistant',
        company: 'Texas A&M University',
        location: 'College Station, TX',
        start: 'June 2020',
        end: 'Present',
        bullets: [
          'Developed a REST API using FastAPI and PostgreSQL to store LSM data.',
          'Built full-stack app with Flask/React/Docker to analyze GitHub data.',
        ],
      },
    ],
    projects: [
      {
        name: 'Gityltics',
        stack: 'Python, Flask, React, PostgreSQL, Docker',
        start: 'June 2020',
        end: 'Present',
        bullets: [
          'Visualized GitHub data to show collaboration.',
          'Implemented GitHub OAuth to pull user repo stats.',
        ],
      },
    ],
    skills: [
      'Java', 'Python', 'C/C++', 'SQL (Postgres)', 'JavaScript', 'React', 'Docker', 'Git'
    ],
    summaryHTML:
      '<p>AI-generated summary goes here. Concise, metrics-driven, tailored to the job.</p>',
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Toolbar - Fixed at top, positioned relative to main content area */}
      <div className="fixed top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200" 
           style={{ 
             left: 'var(--sidebar-width, 64px)', 
             right: '0',
             transition: 'left 300ms ease-in-out'
           }}>
        <div className="w-full flex justify-center items-center p-4">
          <Toolbar editorRef={editorRef} />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto px-6 py-8 pt-24 pb-32">
        <div className="flex-1 p-6">
          <div className="mb-8">
            <Ryan data={data} editorRef={editorRef} />
          </div>
        </div>
      </div>
      
      {/* Job Description Input - Fixed at bottom, positioned relative to main content area */}
      <div className="fixed bottom-0 z-20 bg-white border-t border-gray-200 shadow-lg" 
           style={{ 
             left: 'var(--sidebar-width, 64px)', 
             right: '0',
             transition: 'left 300ms ease-in-out'
           }}>
        <div className="max-w-4xl mx-auto p-4">
          <JobDescription />
        </div>
      </div>
    </div>
  );
}