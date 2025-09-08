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
  location?: string
  start?: string
  end?: string
}

export type ProjectItem = {
  name: string
  stack?: string
  start?: string
  end?: string
  bullets?: Bullet[]
}

export type ResumeData = {
  name: string
  contacts?: string[]   // ["email@x.com", "linkedin.com/in/you", "github.com/you"]
  locationLine?: string // e.g. "Georgetown, TX"
  summaryHTML?: string  // AI summary (HTML OK)
  education?: EducationItem[]
  experience?: ExperienceItem[]
  projects?: ProjectItem[]
  skills?: string[]     // flat list or “Languages: …” etc.
}
