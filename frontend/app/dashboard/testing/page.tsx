// @/pages/testing.tsx
"use client";

import { HTMLTemplateRenderer, openPrintPreview } from '@/lib/TemplateEngine';
import { ryanTemplateSpec } from '@/Templates/html/ryan';
import { useCallback } from 'react';

// Sample resume data with redaction logic
const REDACTED = false; // Toggle this to true for fake data
const resumeJson = {
  fullName: REDACTED ? 'Hidden Name' : 'Jake Ryan',
  email: REDACTED ? 'fake@email.com' : 'realemail@gmail.com',
  phone: REDACTED ? '123-456-fake' : '123-456-7890',
  links: [
    { label: 'LinkedIn', url: REDACTED ? 'https://linkedin.com/in/fake' : 'https://linkedin.com/in/jake' },
    { label: 'GitHub', url: REDACTED ? 'https://github.com/fake' : 'https://github.com/jake' }
  ],
  education: [
    {
      school: 'Southwestern University',
      degree: 'Bachelor of Arts in Computer Science, Minor in Business',
      start: 'Aug. 2018',
      end: 'May 2021',
      location: 'Georgetown, TX'
    }
  ],
  experiences: [
    {
      role: 'Undergraduate Research Assistant',
      company: 'Texas A&M University',
      start: 'Jul 2021',
      end: 'Present',
      location: 'College Station, TX',
      bullets: [
        { item: 'Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems' },
        { item: 'Developed a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data' },
        { item: 'Explored ways to visualize GitHub collaboration in a classroom setting' }
      ]
    },
    {
      role: 'Information Technology Support Specialist',
      company: 'Southwestern University',
      start: 'Sep. 2018',
      end: 'Present',
      location: 'Georgetown, TX',
      bullets: [
        { item: 'Communicate with managers to set up campus computers used on campus' },
        { item: 'Assess and troubleshoot computer problems brought by students, faculty and staff' },
        { item: 'Maintain upkeep of computers, classroom equipment, and 200 printers across campus' }
      ]
    },
    {
      role: 'Artificial Intelligence Research Assistant',
      company: 'Southwestern University',
      start: 'May 2019',
      end: 'Jul 2019',
      location: 'Georgetown, TX',
      bullets: [
        { item: 'Explored methods to generate video game dungeons based off of The Legend of Zelda' },
        { item: 'Developed a game in Java to test the generated dungeons' },
        { item: 'Contributed 50K+ lines of code to an established codebase via Git' },
        { item: 'Conducted a human subject study to determine which video game dungeon generation technique is enjoyable' },
        { item: 'Wrote an 8-page paper and gave multiple presentations on-campus' },
        { item: 'Presented virtually to the World Conference on Computational Intelligence' }
      ]
    }
  ],
  projects: [
    {
      name: 'Gitlytics',
      url: 'https://example.com',
      stack: 'Python, Flask, React, PostgreSQL, Docker',
      start: 'June 2020',
      end: 'Present',
      bullets: [
        { item: 'Developed a full-stack web application using with Flask serving a REST API with React as the frontend' },
        { item: 'Implemented GitHub OAuth to get data from user\'s repositories' },
        { item: 'Visualized GitHub data to show collaboration' },
        { item: 'Used Celery and Redis for asynchronous tasks' }
      ]
    },
    {
      name: 'Simple Paintball',
      url: '',
      stack: 'Spigot API, Java, Maven, TravisCI, Git',
      start: 'May 2018',
      end: 'May 2020',
      bullets: [
        { item: 'Developed a Minecraft server plugin to entertain kids during free time for a previous job' },
        { item: 'Published plugin to websites gaining 2K+ downloads and an average 4.5/5-star review' },
        { item: 'Implemented continuous delivery using TravisCI to build the plugin upon new a release' },
        { item: 'Collaborated with Minecraft server administrators to suggest features and get feedback about the plugin' }
      ]
    }
  ],
  skills: {
    languages: 'Java, Python, C/C++, SQL, PostgreSQL, JavaScript, HTML, CSS, R',
    frameworks: 'React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI',
    tools: 'Git, Docker, TravisCI, Google Cloud Platform, VS Code, AWS',
    libraries: 'pandas, NumPy, Matplotlib'
  }
};

export default function Testing() {
  const downloadPDF = useCallback(async () => {
    try {
      // Generate the HTML using the template engine
      const { buildStandaloneHTML } = await import('@/lib/TemplateEngine');
      const html = buildStandaloneHTML(ryanTemplateSpec, resumeJson);
      
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          html: html,
          filename: 'resume.pdf' 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'resume.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  return (
    <div>
      <HTMLTemplateRenderer spec={ryanTemplateSpec} data={resumeJson} />
      <button
        onClick={() => openPrintPreview(ryanTemplateSpec, resumeJson)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md my-4"
        style={{ margin: '20px', padding: '10px 20px' }}
      >
        Print Resume
      </button>
      <button
        onClick={downloadPDF}
        style={{ margin: '20px', padding: '10px 20px' }}
        className="bg-blue-500 text-white px-4 py-2 rounded-md my-4"
      >
        Download PDF
      </button>
    </div>
  );
}