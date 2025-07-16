import { z } from 'zod';

export const JobDescriptionSchema = z.object({
  skills: z.array(z.string()).describe('List of technical, soft, or industry-specific skills required'),
  experienceLevel: z.string().describe('Required experience level (e.g., "3+ years", "Entry-level", "Senior")'),
  responsibilities: z.array(z.string()).describe('List of key responsibilities or duties'),
});

export type JobDescriptionData = z.infer<typeof JobDescriptionSchema>;