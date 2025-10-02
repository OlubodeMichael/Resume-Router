// utils/mapRecordToTemplateData.ts
import type { ResumeRecord } from '@/types/resume-record.schema'
import type { ResumeData } from '@/types/resume'
import { sanitizeHtml } from '@/lib/sanitize'
import { formatDegree } from '@/utils/formatDegree'
import { capitalize } from '@/utils/formatString'



function cleanUrl(url: string): string {
  if (!url) return url
  
  // Remove http://www. and https://www. prefixes and trailing slashes
  return url
    .replace(/^https?:\/\/www\./, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '') // Remove trailing slash
}

export function mapRecordToTemplateData(rec: ResumeRecord): ResumeData {
  const c = rec.content
  const header = c.header

  // Clean LinkedIn and portfolio URLs
  const cleanLinkedIn = cleanUrl(header.linkedIn)
  const cleanPortfolio = cleanUrl(header.portfolio)

  
  
  return {
    name: header.name,
    email: header.email,
    phone: header.phone,
    linkedIn: header.linkedIn,
    portfolio: header.portfolio,
    contacts: [header.phone, header.email, cleanLinkedIn, cleanPortfolio].filter(Boolean),
    summaryHTML: header.summary ? sanitizeHtml(`<p>${header.summary}</p>`) : undefined,

    education: (c.education ?? []).map(e => {
      // Use startDate and endDate if available, otherwise fall back to graduationYear calculation
      let startDate = '';
      let endDate = '';
      
      if (e.startDate && e.endDate) {
        // Use the actual start and end dates from the data
        startDate = e.startDate;
        endDate = e.endDate;
      } else if (e.graduationYear) {
        // Fallback to graduation year calculation
        startDate = (parseInt(e.graduationYear) - 4).toString();
        endDate = e.graduationYear;
      } else {
        // Provide default dates if no dates are available
        const currentYear = new Date().getFullYear();
        startDate = (currentYear - 4).toString(); // Assume 4-year degree
        endDate = currentYear.toString();
      }
      
      return {
        school: e.school,
        degree: formatDegree(e.degree, e.fieldOfStudy),
        fieldOfStudy: e.fieldOfStudy,
        location: e.location,
        start: startDate,
        end: endDate,
        gpa: e.gpa,
      };
    }),

    experience: (c.experience ?? []).map(x => ({
      title: x.title,
      company: x.company,
      location: x.location,
      start: x.startDate,
      end: x.endDate,
      bullets: x.responsibilities ?? [],
    })),

    projects: (c.projects ?? []).map(p => ({
      name: p.title,
      stack: undefined,
      start: undefined,
      end: undefined,
      bullets: p.bullets ?? (p.description ? [p.description] : []),
    })),

    skills: (c.skills ?? []).map(capitalize),
    categorizedSkills: c.categorizedSkills ? {
      languages: c.categorizedSkills.languages?.map(capitalize) || [],
      librariesFrameworks: c.categorizedSkills.librariesFrameworks?.map(capitalize) || [],
      developerTools: c.categorizedSkills.developerTools?.map(capitalize) || [],
    } : undefined,
  }
}
