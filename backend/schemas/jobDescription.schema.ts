import { z } from 'zod';

export const JobDescriptionSchema = z.object({
  skills: z.array(z.string()).describe('List of technical, soft, or industry-specific skills required'),
  experienceLevel: z.string().describe('Required experience level (e.g., "3+ years", "Entry-level", "Senior")'),
  responsibilities: z.array(z.string()).describe('List of key responsibilities or duties'),
  technologies: z.array(z.string()).optional().describe('List of specific technologies, frameworks, and tools'),
  qualifications: z.array(z.string()).optional().describe('List of required qualifications and certifications'),
  industry: z.string().optional().describe('Industry type (e.g., "Technology", "Healthcare", "Marketing")'),
  jobTitle: z.string().optional().describe('Job title or position name'),
});

export type JobDescriptionData = z.infer<typeof JobDescriptionSchema>;