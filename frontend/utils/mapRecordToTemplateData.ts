// utils/mapRecordToTemplateData.ts
import type { ResumeRecord } from '@/types/resume-record.schema'
import type {
  ResumeData,
  CertItem,
  VolunteerItem,
  LeadershipItem,
  AwardHonorItem,
  PublicationItem,
  ReferenceItem,
  ExperienceItem,
  ProjectItem,
} from '@/types/resume'
import { sanitizeHtml } from '@/lib/sanitize'
import { formatDegree } from '@/utils/formatDegree'
import { capitalize } from '@/utils/formatString'

type ResumeContentExtended = ResumeRecord['content'] & {
  objective?: unknown
  certifications?: unknown
  volunteer?: unknown
  leadership?: unknown
  awardsHonors?: unknown
  awards?: unknown
  publications?: unknown
  references?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readTrimmedString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const readOptionalString = (value: unknown): string | undefined => {
  const trimmed = readTrimmedString(value)
  return trimmed.length ? trimmed : undefined
}

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? [trimmed] : []
  }

  return []
}

const pickFirstNonEmpty = <T>(...candidates: T[][]): T[] => {
  for (const candidate of candidates) {
    if (candidate.length) {
      return candidate
    }
  }

  return []
}



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
  const c = rec.content as ResumeContentExtended
  const header = c.header

  const cleanLinkedIn = cleanUrl(header.linkedIn)
  const cleanPortfolio = cleanUrl(header.portfolio)

  const sanitizeParagraph = (value?: string | null) => {
    const trimmed = typeof value === 'string' ? value.trim() : ''
    return trimmed.length ? sanitizeHtml(`<p>${trimmed}</p>`) : undefined
  }

  const cleanString = (value?: string | null) => {
    if (typeof value !== 'string') return ''
    return value.trim()
  }

  const objectiveValue = cleanString(readOptionalString(c.objective) ?? null)
  const objective = objectiveValue.length ? objectiveValue : undefined

  const certificationsRaw: CertItem[] = Array.isArray(c.certifications)
    ? c.certifications
        .map((cert) => {
          if (!isRecord(cert)) return null

          const title = readTrimmedString(cert.title) || readTrimmedString(cert.name)
          const issuedBy =
            readOptionalString(cert.issuedBy) ?? readOptionalString(cert.issuer) ?? readOptionalString(cert.organization)
          const start = readOptionalString(cert.startDate) ?? readOptionalString(cert.start)
          const end = readOptionalString(cert.endDate) ?? readOptionalString(cert.end)

          const candidate: CertItem = {
            title,
            ...(issuedBy ? { issuedBy } : {}),
            ...(start ? { start } : {}),
            ...(end ? { end } : {}),
          }

          return candidate.title || candidate.issuedBy || candidate.start || candidate.end ? candidate : null
        })
        .filter((cert): cert is CertItem => cert !== null)
    : []

  const volunteerRaw: VolunteerItem[] = Array.isArray(c.volunteer)
    ? c.volunteer
        .map((entry) => {
          if (!isRecord(entry)) return null

          const organization =
            readTrimmedString(entry.organization) ||
            readTrimmedString(entry.org) ||
            readTrimmedString(entry.company) ||
            readTrimmedString(entry.name)
          const role =
            readTrimmedString(entry.role) ||
            readTrimmedString(entry.position) ||
            readTrimmedString(entry.title)
          const location = readTrimmedString(entry.location)
          const start =
            readOptionalString(entry.startDate) ?? readOptionalString(entry.start) ?? readOptionalString(entry.from)
          const end = readOptionalString(entry.endDate) ?? readOptionalString(entry.end) ?? readOptionalString(entry.to)
          const bullets = pickFirstNonEmpty(
            toStringArray(entry.responsibilities),
            toStringArray(entry.bullets),
            toStringArray(entry.points)
          )

          const candidate: VolunteerItem = {
            ...(organization ? { organization } : {}),
            ...(role ? { role } : {}),
            ...(location ? { location } : {}),
            ...(start ? { start } : {}),
            ...(end ? { end } : {}),
            ...(bullets.length ? { bullets } : {}),
          }

          return organization || role || bullets.length ? candidate : null
        })
        .filter((entry): entry is VolunteerItem => entry !== null)
    : []

  const leadershipRaw: LeadershipItem[] = Array.isArray(c.leadership)
    ? c.leadership
        .map((entry) => {
          if (!isRecord(entry)) return null

          const organization =
            readTrimmedString(entry.organization) ||
            readTrimmedString(entry.org) ||
            readTrimmedString(entry.group) ||
            readTrimmedString(entry.name)
          const role =
            readTrimmedString(entry.role) ||
            readTrimmedString(entry.position) ||
            readTrimmedString(entry.title)
          const location = readTrimmedString(entry.location)
          const start =
            readOptionalString(entry.startDate) ?? readOptionalString(entry.start) ?? readOptionalString(entry.from)
          const end = readOptionalString(entry.endDate) ?? readOptionalString(entry.end) ?? readOptionalString(entry.to)
          const bullets = pickFirstNonEmpty(
            toStringArray(entry.responsibilities),
            toStringArray(entry.bullets),
            toStringArray(entry.points)
          )

          const candidate: LeadershipItem = {
            ...(organization ? { organization } : {}),
            ...(role ? { role } : {}),
            ...(location ? { location } : {}),
            ...(start ? { start } : {}),
            ...(end ? { end } : {}),
            ...(bullets.length ? { bullets } : {}),
          }

          return organization || role || bullets.length ? candidate : null
        })
        .filter((entry): entry is LeadershipItem => entry !== null)
    : []

  const awardsSource = Array.isArray(c.awardsHonors) ? c.awardsHonors : Array.isArray(c.awards) ? c.awards : []

  const awardsHonorsRaw: AwardHonorItem[] = awardsSource
    .map((award) => {
      if (!isRecord(award)) return null

      const title = readTrimmedString(award.title) || readTrimmedString(award.name)
      const issuer = readOptionalString(award.issuer) ?? readOptionalString(award.organization)
      const date = readOptionalString(award.date) ?? readOptionalString(award.awardedDate)
      const description = readOptionalString(award.description)

      const candidate: AwardHonorItem = {
        title,
        ...(issuer ? { issuer } : {}),
        ...(date ? { date } : {}),
        ...(description ? { description } : {}),
      }

      return candidate.title || candidate.issuer || candidate.date || candidate.description ? candidate : null
    })
    .filter((award): award is AwardHonorItem => award !== null)

  const publicationsRaw: PublicationItem[] = Array.isArray(c.publications)
    ? c.publications
        .map((pub) => {
          if (!isRecord(pub)) return null

          const title = readTrimmedString(pub.title) || readTrimmedString(pub.name)
          const date = readOptionalString(pub.date) ?? readOptionalString(pub.publishedDate)
          const bullets = pickFirstNonEmpty(
            toStringArray(pub.highlights),
            toStringArray(pub.summary),
            toStringArray(pub.description)
          )

          const candidate: PublicationItem = {
            title,
            ...(date ? { date } : {}),
            ...(bullets.length ? { bullets } : {}),
          }

          return candidate.title || bullets.length ? candidate : null
        })
        .filter((pub): pub is PublicationItem => pub !== null)
    : []

  const referencesRaw: ReferenceItem[] = Array.isArray(c.references)
    ? c.references
        .map((ref) => {
          if (!isRecord(ref)) return null

          const name = readTrimmedString(ref.name)
          const contactCandidates = [
            readTrimmedString(ref.contact),
            readTrimmedString(ref.email),
            readTrimmedString(ref.phone),
            readTrimmedString(ref.linkedin),
          ].filter(Boolean)
          const contact = contactCandidates.length ? contactCandidates.join(' | ') : ''
          const relationship = readTrimmedString(ref.relationship) || readTrimmedString(ref.title)
          const notes = readTrimmedString(ref.notes) || readTrimmedString(ref.summary)

          const candidate: ReferenceItem = {
            name,
            ...(contact ? { contact } : {}),
            ...(relationship ? { relationship } : {}),
            ...(notes ? { notes } : {}),
          }

          return candidate.name || candidate.contact || candidate.relationship || candidate.notes ? candidate : null
        })
        .filter((ref): ref is ReferenceItem => ref !== null)
    : []

  const education = (c.education ?? []).map(e => {
    const edu = e as typeof e & {
      schoolRightSide?: 'date' | 'location';
      schoolLocation?: string;
      degreeLocationShow?: boolean;
      degreeLocationPosition?: 'left' | 'right';
      degreeLocation?: string;
      degreeGpaShow?: boolean;
    };
    
    let startDate = '';
    let endDate = '';

    if (edu.startDate && edu.endDate) {
      startDate = edu.startDate;
      endDate = edu.endDate;
    } else if (edu.graduationYear) {
      startDate = (parseInt(edu.graduationYear) - 4).toString();
      endDate = edu.graduationYear;
    } else {
      const currentYear = new Date().getFullYear();
      startDate = (currentYear - 4).toString();
      endDate = currentYear.toString();
    }

    return {
      school: edu.school,
      degree: formatDegree(edu.degree, edu.fieldOfStudy),
      fieldOfStudy: edu.fieldOfStudy,
      location: edu.location,
      start: startDate,
      end: endDate,
      gpa: edu.gpa,
      // Display preferences
      schoolRightSide: edu.schoolRightSide || 'date',
      schoolLocation: edu.schoolLocation,
      degreeLocationShow: edu.degreeLocationShow || false,
      degreeLocationPosition: edu.degreeLocationPosition || 'right',
      degreeLocation: edu.degreeLocation,
      degreeGpaShow: edu.degreeGpaShow || false,
    };
  }).filter((entry) => entry.school || entry.degree);

  const experiences: ExperienceItem[] = (c.experience ?? [])
    .map((experience) => {
      const extras = experience as typeof experience & Record<string, unknown>
      const title = experience.title || readTrimmedString(extras.role)
      const company = experience.company || readTrimmedString(extras.organization)
      const location = readTrimmedString(experience.location)
      const start = readOptionalString(experience.startDate) ?? readOptionalString(extras.start) ?? ''
      const end = readOptionalString(experience.endDate) ?? readOptionalString(extras.end) ?? ''
      const bullets = pickFirstNonEmpty(
        toStringArray(experience.responsibilities),
        toStringArray(extras.bullets),
        toStringArray(extras.description)
      )

      const candidate: ExperienceItem = {
        title,
        company,
        ...(location ? { location } : {}),
        start,
        end,
        ...(bullets.length ? { bullets } : {}),
      }

      return candidate.title || candidate.company || (candidate.bullets?.length ?? 0) > 0 ? candidate : null
    })
    .filter((entry): entry is ExperienceItem => entry !== null)

  const projects: ProjectItem[] = (c.projects ?? [])
    .map((project) => {
      const record = (project ?? {}) as Record<string, unknown>
      const title = readTrimmedString(record.title) || readTrimmedString(record.name)
      const techs = toStringArray(record.technologies).join(', ')
      const stack = readTrimmedString(record.stack) || techs
      const bullets = pickFirstNonEmpty(
        toStringArray(record.bullets),
        toStringArray(record.description)
      )
      const start = readOptionalString(record.start) ?? readOptionalString(record.startDate)
      const end = readOptionalString(record.end) ?? readOptionalString(record.endDate)

      const candidate: ProjectItem = {
        name: title,
        ...(stack ? { stack } : {}),
        ...(start ? { start } : {}),
        ...(end ? { end } : {}),
        ...(bullets.length ? { bullets } : {}),
      }

      return candidate.name || candidate.stack || (candidate.bullets?.length ?? 0) > 0 ? candidate : null
    })
    .filter((entry): entry is ProjectItem => entry !== null)

  const skillsFlat = (c.skills ?? []).map((skill) => capitalize(skill)).filter(Boolean);

  const skillsObject = c.categorizedSkills
    ? {
        languages: (c.categorizedSkills.languages || []).map(capitalize).filter(Boolean).join(', '),
        libraries: (c.categorizedSkills.librariesFrameworks || []).map(capitalize).filter(Boolean).join(', '),
        tools: (c.categorizedSkills.developerTools || []).map(capitalize).filter(Boolean).join(', '),
      }
    : {
        languages: '',
        libraries: '',
        tools: '',
      };

  if (!skillsObject.languages && skillsFlat.length) {
    skillsObject.languages = skillsFlat.join(', ');
  }

  return {
    name: header.name,
    email: header.email,
    phone: header.phone,
    linkedIn: header.linkedIn,
    portfolio: header.portfolio,
    contacts: [header.phone, header.email, cleanLinkedIn, cleanPortfolio].filter(Boolean),
    summaryHTML: sanitizeParagraph(header.summary),
    objective,
    ...(education.length ? { education } : {}),
    ...(experiences.length ? { experience: experiences } : {}),
    ...(projects.length ? { projects } : {}),
    ...(skillsFlat.length ? { skills: skillsFlat } : {}),
    ...(skillsObject.languages || skillsObject.libraries || skillsObject.tools
      ? {
          categorizedSkills: {
            languages: skillsObject.languages ? skillsObject.languages.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
            librariesFrameworks: skillsObject.libraries ? skillsObject.libraries.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
            developerTools: skillsObject.tools ? skillsObject.tools.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          },
        }
      : {}),
    ...(certificationsRaw.length ? { certifications: certificationsRaw } : {}),
    ...(volunteerRaw.length ? { volunteer: volunteerRaw } : {}),
    ...(leadershipRaw.length ? { leadership: leadershipRaw } : {}),
    ...(awardsHonorsRaw.length ? { awardsHonors: awardsHonorsRaw } : {}),
    ...(publicationsRaw.length ? { publications: publicationsRaw } : {}),
    ...(referencesRaw.length ? { references: referencesRaw } : {}),
  }
}
