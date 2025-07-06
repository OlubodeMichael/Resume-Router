import { z } from 'zod';

export const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  linkedin: z.string().url("Invalid LinkedIn URL").optional(),
  address: z.string().optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid startDate",
  }),
  endDate: z.string().optional(),
});

export const educationSchema = z.object({
  school: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  endDate: z.string().optional(),
});

export const resumeInputSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    linkedin: z.string().url().optional(),
    address: z.string().optional(),
  }),
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(z.string()).optional(),
});

