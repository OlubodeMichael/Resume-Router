// types/resume-record.schema.ts
import { z } from 'zod'

export const ResumeRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  jobDescriptionId: z.string().uuid(),
  content: z.object({
    header: z.object({
      name: z.string().min(1),
      email: z.string().transform((val) => {
        // If email is empty or invalid, use a default
        if (!val || val.trim() === '' || !val.includes('@')) {
          return "user@example.com";
        }
        return val;
      }).pipe(z.string().email()),
      phone: z.string().default(""),
      linkedIn: z.string().default(""),
      portfolio: z.string().default(""),
      summary: z.string().optional(),
    }),
    skills: z.array(z.string()).default([]),
    projects: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      bullets: z.array(z.string()).optional(),
    })).default([]),
    education: z.array(z.object({
      degree: z.string(),
      school: z.string(),
      graduationYear: z.string().optional(),
      location: z.string().optional(),
    })).default([]),
    experience: z.array(z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      location: z.string().optional(),
      responsibilities: z.array(z.string()).default([]),
    })).default([]),
    achievements: z.array(z.string()).default([]),
  }),
}).passthrough() // ignores createdAt/updatedAt if present

export type ResumeRecord = z.infer<typeof ResumeRecordSchema>
