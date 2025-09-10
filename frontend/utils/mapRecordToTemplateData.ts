// utils/mapRecordToTemplateData.ts
import type { ResumeRecord } from '@/types/resume-record.schema'
import type { ResumeData } from '@/types/resume'
import { sanitizeHtml } from '@/lib/sanitize'

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
    contacts: [header.phone, header.email, cleanLinkedIn, cleanPortfolio].filter(Boolean),
    summaryHTML: header.summary ? sanitizeHtml(`<p>${header.summary}</p>`) : undefined,

    education: (c.education ?? []).map(e => ({
      school: e.school,
      degree: e.degree,
      location: e.location,
      start: undefined,
      end: e.graduationYear,
    })),

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

    skills: c.skills ?? [],
  }
}
