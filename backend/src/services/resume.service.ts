import { prisma } from '../../lib/prisma';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// Define schema for resume content
export const ResumeContentSchema = z.object({
  header: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    summary: z.string().optional(),
  }),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      responsibilities: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      school: z.string(),
      graduationYear: z.string().optional(),
    })
  ),
  projects: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ).optional(),
  achievements: z.array(
    z.object({
      title: z.string(),
      issuedBy: z.string().optional(),
    })
  ).optional(),
});

export type ResumeContent = z.infer<typeof ResumeContentSchema>;

// Initialize LLM
const llm = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo', // Replace with xAI's model when available
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.2,
});

// Prompt for resume generation
const prompt = PromptTemplate.fromTemplate(`
  Generate a tailored resume based on the user's profile and job description.
  Output in JSON format with the following structure:

  Instructions:
  - Match the user's skills, experience, education, projects, and achievements to the job description's skills, experience level, and responsibilities.
  - For skills, prioritize exact matches with the job description's skills, including synonyms or related terms (e.g., "JavaScript" and "JS").
  - For experience, rephrase the user's responsibilities to incorporate keywords from the job description's responsibilities, ensuring alignment without copying verbatim. Highlight measurable outcomes (e.g., "Increased sales by 20%" if relevant).
  - If the user's experience lacks direct alignment, infer relevant responsibilities based on their skills and the job description.
  - For education, include only degrees and institutions relevant to the job description's requirements.
  - For projects and achievements, select those that demonstrate skills or responsibilities from the job description.
  - Create a concise professional summary (50-100 words) that highlights the user's relevant skills and experience for the role.
  - Optimize for ATS: Use exact keywords from the job description, avoid abbreviations unless specified, and ensure responsibilities are action-oriented (e.g., "Developed", "Managed").
  - If profile or job description data is missing, provide defaults (e.g., empty arrays for skills, generic summary).
  
  {{
    "header": {{
      "name": "string",
      "email": "string",
      "phone": "string (optional)",
      "summary": "string (optional)"
    }},
    "skills": ["skill1", "skill2"],
    "experience": [
      {{
        "title": "string",
        "company": "string",
        "startDate": "string",
        "endDate": "string (optional)",
        "responsibilities": ["responsibility1", "responsibility2"]
      }}
    ],
    "education": [
      {{
        "degree": "string",
        "school": "string",
        "graduationYear": "string (optional)"
      }}
    ],
    "projects": [
      {{
        "title": "string",
        "description": "string"
      }}
    ],
    "achievements": [
      {{
        "title": "string",
        "issuedBy": "string (optional)"
      }}
    ]
  }}

  User Profile:
  {profile}

  Job Description Parsed Data:
  {jobDescription}

  Instructions:
  - Match the user's skills, experience, education, projects, and achievements to the job description's requirements.
  - Prioritize skills and experiences that align with the job's skills, experience level, and responsibilities.
  - Create a professional summary tailored to the job.
  - Ensure the output is concise and relevant to the job description.
`);

// Generate Resume
export const generateResume = async (
  userId: string,
  jobDescriptionId?: string
): Promise<ResumeContent> => {
  // Fetch user profile
  let profile = await prisma.profile.findUnique({
    where: { userId },
    select: { skills: true, experience: true, education: true, projects: true, achievements: true },
  });

  // If profile doesn't exist, create a default one
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        achievements: [],
      },
      select: { skills: true, experience: true, education: true, projects: true, achievements: true },
    });
  }

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Fetch job description (if provided)
  let jobDescription = null;
  if (jobDescriptionId) {
    jobDescription = await prisma.jobDescription.findUnique({
      where: { id: jobDescriptionId },
      select: { parsedData: true },
    });
    if (!jobDescription) {
      throw new Error('Job description not found');
    }
  }

  // Properly cast JSON fields from profile
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const education = Array.isArray(profile.education) ? profile.education : [];
  const projects = Array.isArray(profile.projects) ? profile.projects : [];
  const achievements = Array.isArray(profile.achievements) ? profile.achievements : [];
  
  // Handle skills - extract skill names from database
  const skills = Array.isArray(profile.skills) 
    ? profile.skills.map(skill => {
        if (typeof skill === 'string') {
          // Handle legacy string format
          return skill;
        } else if (skill && typeof skill === 'object' && 'name' in skill) {
          // Handle new Skill object format - extract just the name
          return (skill as any).name;
        } else {
          // Handle invalid format
          return 'Unknown Skill';
        }
      })
    : [];

  // Default resume content
  let resumeContent: ResumeContent = {
    header: {
      name: user.name || 'Unknown',
      email: user.email,
      phone: '',
      summary: 'Professional with relevant skills and experience.',
    },
    skills: skills,
    experience: experience as any,
    education: education as any,
    projects: projects as any,
    achievements: achievements as any,
  };

  try {
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const result = await chain.invoke({
      profile: JSON.stringify(profile),
      jobDescription: jobDescription ? JSON.stringify(jobDescription.parsedData) : '{}',
    });
    
    // Parse the JSON response
    const parsed = JSON.parse(result);
    resumeContent = {
      header: parsed.header || resumeContent.header,
      skills: parsed.skills || resumeContent.skills,
      experience: parsed.experience || resumeContent.experience,
      education: parsed.education || resumeContent.education,
      projects: parsed.projects || resumeContent.projects,
      achievements: parsed.achievements || resumeContent.achievements,
    };
  } catch (error) {
    console.error('Resume generation failed:', error);
    // Return default resume content
  }

  return resumeContent;
};