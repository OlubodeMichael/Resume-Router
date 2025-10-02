import type { ResumeData } from '@/types/resume'
import { capitalize } from '@/utils/formatString'
import { formatDegree } from '@/utils/formatDegree'

// Type for data that might include categorized skills
type ResumeDataWithCategorizedSkills = ResumeData & {
  categorizedSkills?: {
    languages?: string[]
    librariesFrameworks?: string[]
    developerTools?: string[]
  }
}

export const DEFAULT_RESUME: ResumeData = {
  name: 'Your Name',
  email: 'your.email@example.com',
  phone: '(555) 123-4567',
  linkedIn: 'https://linkedin.com/in/yourprofile',
  portfolio: 'https://yourportfolio.com',
  contacts: [],
  education: [
    {
      school: 'University Name',
      degree: 'Degree Program',
      start: '2020',
      end: '2024',
      location: 'City, State'
    }
  ],
  experience: [
    {
      title: 'Job Title',
      company: 'Company Name',
      start: '2022',
      end: 'Present',
      location: 'City, State',
      bullets: ['Achievement or responsibility', 'Another key accomplishment']
    }
  ],
  projects: [
    {
      name: 'Project Name',
      stack: 'Technologies Used',
      start: '2023',
      end: '2024',
      bullets: ['Project description', 'Key features or outcomes']
    }
  ],
  skills: [
    'JavaScript', 'Python', 'React', 'Node.js', 'Git', 'Docker',
  ],
  summaryHTML: undefined,
}

/**
 * Extract all skills from all sources (profile, experience, projects, etc.)
 * Note: This is a fallback function. The backend AI should handle most skill extraction.
 */
const extractAllSkills = (data: ResumeDataWithCategorizedSkills): string[] => {
  const allSkills = new Set<string>();
  
  // Add skills from the profile skills array (these come from the database)
  if (data.skills) {
    data.skills.forEach(skill => allSkills.add(skill.trim()));
  }
  
  // Extract skills from project technologies
  if (data.projects) {
    data.projects.forEach(project => {
      // Add skills from project technologies
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach((tech: string) => allSkills.add(tech.trim()));
      }
      
      // Add skills from project stack (legacy field)
      if (project.stack) {
        project.stack.split(',').forEach(stack => allSkills.add(stack.trim()));
      }
    });
  }
  
  return Array.from(allSkills);
};

/**
 * Transform ResumeData to match ryan template data structure
 */
export const transformResumeData = (data: ResumeDataWithCategorizedSkills) => {
  // Clean up LinkedIn URL for display
  const cleanLinkedInDisplay = (url: string) => {
    if (!url) return '';
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, ''); // Remove trailing slash
  };

  // Clean up portfolio URL for display
  const cleanPortfolioDisplay = (url: string) => {
    if (!url) return '';
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, ''); // Remove trailing slash
  };

  const linkedIn = data.linkedIn || '';
  const portfolio = data.portfolio || '';

  return {
    fullName: data.name,
    email: data.email || data.contacts?.find(c => c.includes('@')) || '',
    phone: data.phone || data.contacts?.find(c => {
      const trimmed = c.trim();
      const isPhone = /^[\+]?[\d\s\-\(\)\.]{7,}$/.test(trimmed) || /^\d{10,}$/.test(trimmed);
      return isPhone;
    }) || '',
    linkedIn: linkedIn,
    portfolio: portfolio,
    linkedInDisplay: cleanLinkedInDisplay(linkedIn),
    portfolioDisplay: cleanPortfolioDisplay(portfolio),
    education: (data.education || []).map(ed => {
      return {
        school: ed.school,
        degree: formatDegree(ed.degree || '', ed.fieldOfStudy),
        start: ed.start || '',
        end: ed.end || '',
        location: ed.location || ''
      };
    }),
    experiences: (data.experience || []).map(exp => ({
      role: exp.title,
      company: exp.company,
      start: exp.start,
      end: exp.end,
      location: exp.location || 'Remote',
      bullets: exp.bullets?.map(b => ({ item: b })) || []
    })),
    projects: (data.projects || []).map(proj => ({
      name: proj.name,
      url: '',
      stack: proj.stack || '',
      start: proj.start || '',
      end: proj.end || '',
      bullets: proj.bullets?.map(b => ({ item: b })) || []
    })),
    skills: (() => {
      // Use AI-generated categorized skills if available, otherwise extract and categorize all skills
      if (data.categorizedSkills) {
        return {
          languages: data.categorizedSkills.languages?.map(capitalize).join(', ') || '',
          frameworks: data.categorizedSkills.librariesFrameworks?.map(capitalize).join(', ') || '',
          tools: data.categorizedSkills.developerTools?.map(capitalize).join(', ') || '',
          libraries: data.categorizedSkills.librariesFrameworks?.map(capitalize).join(', ') || '',
          skills: (data.skills || []).map(capitalize).join(', ') // For templates that expect flat skills
        };
      } else {
        // Fallback: Use basic skill extraction (AI should handle most categorization)
        const allSkills = extractAllSkills(data);
        
        return {
          languages: '',
          frameworks: '',
          tools: '',
          libraries: '',
          skills: allSkills.map(capitalize).join(', ') // For templates that expect flat skills
        };
      }
    })()
  }
}
