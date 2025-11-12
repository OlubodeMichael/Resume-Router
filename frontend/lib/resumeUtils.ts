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
  summaryHTML: '<p>Experienced developer with a passion for building delightful products.</p>',
  objective: 'Seeking a role where I can contribute to impactful web experiences while growing with a collaborative team.',
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
  certifications: [
    {
      title: 'Certification Name',
      issuedBy: 'Issuing Organization',
      end: '2024'
    }
  ],
  volunteer: [
    {
      organization: 'Community Group',
      role: 'Volunteer Coordinator',
      start: '2021',
      end: '2023',
      bullets: ['Coordinated events', 'Managed volunteer outreach']
    }
  ],
  leadership: [
    {
      organization: 'Tech Club',
      role: 'President',
      start: '2022',
      end: '2023',
      bullets: ['Organized weekly workshops', 'Mentored 10+ members']
    }
  ],
  awardsHonors: [
    {
      title: 'Dean’s List',
      issuer: 'University Name',
      date: '2023'
    }
  ],
  publications: [
    {
      title: 'Understanding Modern Web Architecture',
      venue: 'Tech Journal',
      date: '2024',
      link: 'https://example.com/article'
    }
  ],
  references: [
    {
      name: 'Jane Doe',
      contact: 'jane.doe@example.com | (555) 987-6543',
      relationship: 'Former Manager'
    }
  ]
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
  const toDateRange = (start?: string | null, end?: string | null) => {
    const clean = (value?: string | null) =>
      typeof value === 'string' ? value.trim() : '';
    const startClean = clean(start);
    const endClean = clean(end);
    if (startClean && endClean) return `${startClean} – ${endClean}`;
    return startClean || endClean || '';
  };

  const ensureArray = <T = unknown>(value: unknown): T[] =>
    Array.isArray(value) ? (value as T[]) : [];

  const asRecord = (value: unknown): Record<string, unknown> =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

  const pickString = (record: Record<string, unknown>, ...keys: string[]): string => {
    for (const key of keys) {
      const raw = record[key];
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.length) {
          return trimmed;
        }
      }
    }
    return '';
  };

  const toTextArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(/\n+/).map((part) => part.trim()).filter(Boolean);
    }
    return [];
  };

  const toBulletObjects = (value: unknown) =>
    toTextArray(value).map((item) => ({ item }));

  const summary =
    typeof data.summaryHTML === 'string'
      ? data.summaryHTML
      : typeof data.summary === 'string'
      ? data.summary
      : '';

  const objective =
    typeof data.objective === 'string'
      ? data.objective
      : '';

  const certifications =
    (data.certifications || []).map((cert) => {
      const record = asRecord(cert);
      const startRaw = pickString(record, 'start', 'startDate');
      const endRaw = pickString(record, 'end', 'endDate');
      return {
        name: cert.title || pickString(record, 'name'),
        issuer:
          cert.issuedBy ||
          pickString(record, 'issuer', 'organization'),
        date: toDateRange(startRaw || cert.start, endRaw || cert.end) || pickString(record, 'date', 'awardedDate'),
        description: pickString(record, 'description'),
        bullets: toBulletObjects(record.details ?? record.highlights),
      };
    }).filter((cert) => cert.name || cert.issuer || cert.date || cert.description || cert.bullets.length);

  const volunteerEntries = ensureArray((data as { volunteer?: unknown[] }).volunteer);
  const volunteer = volunteerEntries
    .map((entry): {
      organization: string;
      role: string;
      location: string;
      start: string;
      end: string;
      dateRange: string;
      bullets: { item: string }[];
    } => {
      const record = asRecord(entry);
      const startRaw = pickString(record, 'startDate', 'start', 'from');
      const endRaw = pickString(record, 'endDate', 'end', 'to');
      return {
        organization: pickString(record, 'org', 'organization', 'company', 'name'),
        role: pickString(record, 'role', 'position', 'title'),
        location: pickString(record, 'location', 'city'),
        start: startRaw,
        end: endRaw,
        dateRange: toDateRange(startRaw, endRaw),
        bullets: toBulletObjects(
          record.responsibilities ??
            record.bullets ??
            record.points ??
            record.description ??
            record.summary
        ),
      };
    })
    .filter((item) => item.organization || item.role || item.bullets.length);

  const leadershipEntries = ensureArray(data.leadership);
  const leadership = leadershipEntries
    .map((entry): {
      organization: string;
      role: string;
      location: string;
      start: string;
      end: string;
      dateRange: string;
      bullets: { item: string }[];
    } => {
      const record = asRecord(entry);
      const startRaw = pickString(record, 'startDate', 'start', 'from');
      const endRaw = pickString(record, 'endDate', 'end', 'to');
      return {
        organization: pickString(record, 'organization', 'org', 'group', 'name'),
        role: pickString(record, 'role', 'position', 'title'),
        location: pickString(record, 'location', 'city'),
        start: startRaw,
        end: endRaw,
        dateRange: toDateRange(startRaw, endRaw),
        bullets: toBulletObjects(
          record.responsibilities ??
            record.bullets ??
            record.points ??
            record.description ??
            record.summary
        ),
      };
    })
    .filter((item) => item.organization || item.role || item.bullets.length);

  const publicationsEntries = ensureArray((data as { publications?: unknown[] }).publications);
  const publications = publicationsEntries
    .map((entry): {
      title: string;
      venue: string;
      date: string;
      link: string;
      bullets: { item: string }[];
    } => {
      const record = asRecord(entry);
      return {
        title: pickString(record, 'title', 'name'),
        venue: pickString(record, 'venue', 'publisher', 'journal'),
        date: pickString(record, 'date', 'publishedDate'),
        link: pickString(record, 'url', 'link'),
        bullets: toBulletObjects(
          record.highlights ??
            record.summary ??
            record.description
        ),
      };
    })
    .filter((item) => item.title || item.venue || item.date || item.link || item.bullets.length);

  const awardsEntries = ensureArray((data as { awardsHonors?: unknown[] }).awardsHonors);
  const awardsHonors = awardsEntries
    .map((entry): {
      title: string;
      issuer: string;
      date: string;
      description: string;
      bullets: { item: string }[];
    } => {
      const record = asRecord(entry);
      return {
        title: pickString(record, 'title', 'name'),
        issuer: pickString(record, 'issuer', 'organization'),
        date: pickString(record, 'date', 'awardedDate'),
        description: pickString(record, 'description'),
        bullets: toBulletObjects(record.highlights ?? record.summary),
      };
    })
    .filter((item) => item.title || item.issuer || item.date || item.description || item.bullets.length);

  const referencesEntries = ensureArray((data as { references?: unknown[] }).references);
  const references = referencesEntries
    .map((entry): {
      name: string;
      contact: string;
      relationship: string;
      notes: string;
    } => {
      const record = asRecord(entry);
      const contactParts = [
        pickString(record, 'contact'),
        pickString(record, 'email'),
        pickString(record, 'phone'),
        pickString(record, 'linkedin'),
        pickString(record, 'location'),
      ].filter(Boolean);

      return {
        name: pickString(record, 'name'),
        contact: contactParts.join(' | '),
        relationship: pickString(record, 'relationship', 'title'),
        notes: pickString(record, 'notes', 'summary'),
      };
    })
    .filter((item) => item.name || item.contact || item.relationship || item.notes);

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
    summary,
    objective,
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
      const normalizeToStringArray = (value: unknown): string[] => {
        if (Array.isArray(value)) {
          return value
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean);
        }
        if (typeof value === 'string') {
          return value
            .split(/[,;\n]/)
            .map((item) => item.trim())
            .filter(Boolean);
        }
        return [];
      };

      // Helper to clean and join skills (removes any leading colons)
      const cleanAndJoin = (skills: unknown): string => {
        const list = normalizeToStringArray(skills);
        if (!list.length) return '';
        return list
          .map((s) => {
            const cleaned = s.trim().replace(/^:\s*/, '').trim();
            return capitalize(cleaned);
          })
          .filter(Boolean)
          .join(', ');
      };
      
      // Use AI-generated categorized skills if available, otherwise extract and categorize all skills
      if (data.categorizedSkills) {
        return {
          languages: cleanAndJoin(data.categorizedSkills.languages),
          frameworks: cleanAndJoin(data.categorizedSkills.librariesFrameworks),
          tools: cleanAndJoin(data.categorizedSkills.developerTools),
          libraries: cleanAndJoin(data.categorizedSkills.librariesFrameworks),
          skills: normalizeToStringArray(data.skills)
            .map(capitalize)
            .join(', ')
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
    })(),
    certifications,
    volunteer: volunteer.map((item) => ({
      company: item.organization,
      role: item.role,
      location: item.location,
      start: item.start,
      end: item.end,
      dateRange: item.dateRange,
      bullets: item.bullets,
    })),
    leadership: leadership.map((item) => ({
      company: item.organization,
      role: item.role,
      location: item.location,
      start: item.start,
      end: item.end,
      dateRange: item.dateRange,
      bullets: item.bullets,
    })),
    publications,
    awardsHonors,
    references,
  }
}
