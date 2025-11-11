// types/resume.ts
export type Bullet = string

export type ExperienceItem = {
  title: string
  company: string
  location?: string
  start: string // e.g. "Jun 2022"
  end: string   // e.g. "Present"
  bullets?: Bullet[]
}

export type EducationItem = {
  school: string
  degree: string
  fieldOfStudy?: string
  location?: string
  start?: string
  end?: string
  gpa?: string
}

export type ProjectItem = {
  name: string
  stack?: string
  technologies?: string[] // Array of technologies used in the project
  start?: string
  end?: string
  bullets?: Bullet[]
}

export type AchievementItem = {
  title: string
  description?: string
  issuedBy?: string
}

export type LeadershipItem = {
  organization?: string
  role?: string
  location?: string
  start?: string
  end?: string
  bullets?: Bullet[]
}

export type CertItem = {
  title: string
  issuedBy?: string
  start?: string
  end?: string
}

export type VolunteerItem = {
  organization?: string
  role?: string
  location?: string
  start?: string
  end?: string
  bullets?: Bullet[]
}

export type PublicationItem = {
  title: string
  venue?: string
  date?: string
  link?: string
  bullets?: Bullet[]
}

export type AwardHonorItem = {
  title: string
  issuer?: string
  date?: string
  description?: string
  bullets?: Bullet[]
}

export type ReferenceItem = {
  name: string
  contact?: string
  relationship?: string
  notes?: string
}

export type ResumeData = {
  name: string
  email?: string
  phone?: string
  linkedIn?: string
  portfolio?: string
  contacts?: string[]   // ["email@x.com", "linkedin.com/in/you", "github.com/you"]
  locationLine?: string // e.g. "Georgetown, TX"
  summaryHTML?: string  // AI summary (HTML OK)
  summary?: string
  objective?: string
  education?: EducationItem[]
  experience?: ExperienceItem[]
  projects?: ProjectItem[]
  skills?: string[]     // flat list or "Languages: …" etc.
  categorizedSkills?: {
    languages?: string[]
    librariesFrameworks?: string[]
    developerTools?: string[]
  }
  achievements?: AchievementItem[]
  certifications?: CertItem[]
  leadership?: LeadershipItem[]
  volunteer?: VolunteerItem[]
  publications?: PublicationItem[]
  awardsHonors?: AwardHonorItem[]
  references?: ReferenceItem[]
}

