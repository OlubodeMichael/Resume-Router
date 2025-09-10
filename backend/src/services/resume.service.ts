// backend/src/services/resume.service.ts
import { prisma } from "../../lib/prisma";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

/* ----------------------------------------------------------------------------
 * Small helpers
 * --------------------------------------------------------------------------*/
function smartTrimResume(text: string, max = 35000) {
  if (text.length <= max) return text;
  const head = text.slice(0, Math.floor(max * 0.6));
  const tail = text.slice(-Math.floor(max * 0.4));
  return `${head}\n...\n${tail}`;
}

function extractJsonFromText(s: string): string {
  // 1) if fenced, take inner
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) return fence[1].trim();

  // 2) fallback: slice from first "{" to last "}"
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return s.slice(start, end + 1).trim();
  }
  return s.trim();
}

/* ----------------------------------------------------------------------------
 * Zod Schemas & Types
 * --------------------------------------------------------------------------*/

// Extraction (resume text -> profile-ish fields)
const ExtractorSchema = z.object({
  fullName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  linkedIn: z.string().nullable().optional(),
  portfolio: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  pronouns: z.string().nullable().optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string().nullable().optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        description: z.array(z.string()).optional(),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string().nullable().optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        gpa: z.string().nullable().optional(),
      })
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  summary: z.string().nullable().optional(),
});
type ExtractedProfile = z.infer<typeof ExtractorSchema>;

// Dynamic content that AI will generate (tailored to job description)
export const DynamicResumeContentSchema = z.object({
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        responsibilities: z.array(z.string()).default([]),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        title: z.string(),
        bullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  achievements: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        issuedBy: z.string().optional(),
      })
    )
    .default([]),
});
export type DynamicResumeContent = z.infer<typeof DynamicResumeContentSchema>;

// Final resume JSON shape (static + dynamic)
export const ResumeContentSchema = z.object({
  header: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    linkedIn: z.string().optional(),
    portfolio: z.string().optional(),
    summary: z.string().optional(),
  }),
  skills: z.array(z.string()).default([]),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        responsibilities: z.array(z.string()).default([]),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string(),
        school: z.string(),
        graduationYear: z.string().optional(),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        title: z.string(),
        bullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  achievements: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        issuedBy: z.string().optional(),
      })
    )
    .default([]),
});
export type ResumeContent = z.infer<typeof ResumeContentSchema>;

/* ----------------------------------------------------------------------------
 * Prompts
 * --------------------------------------------------------------------------*/

const extractorPrompt = ChatPromptTemplate.fromTemplate(
  `Extract the following fields from the resume text and return ONLY valid JSON (no extra text). 
If a field is missing, omit it or use null; arrays should be [].

Fields:
- fullName, email, phone, location, linkedIn, portfolio, jobTitle, pronouns
- experience[]: {{ title, company?, startDate?, endDate?, description?: string[] }}
- education[]: {{ institution, degree?, startDate?, endDate?, gpa? }}
- skills[]: string
- summary

Resume text:
{resume_text}`
);

const generationPrompt = PromptTemplate.fromTemplate(`
  You are a professional resume writer. Generate ONLY the dynamic content that needs to be tailored to the job description.
  
  IMPORTANT: You are NOT generating the complete resume. You are only generating the content that changes based on the job description.
  
  STATIC CONTENT (DO NOT GENERATE - will be provided separately):
  - Header (name, email, phone, LinkedIn, portfolio) - personal information
  - Education - factual information that doesn't change
  - Basic project titles and achievement titles
  - Personal information (location, job title, pronouns) - user-provided data
  
  DYNAMIC CONTENT (GENERATE THIS):
  - Professional Summary
  - Skills (prioritized and matched to JD)
  - Experience descriptions (responsibilities with metrics)
  - Project descriptions (tailored with metrics)
  - Achievement descriptions (enhanced with metrics)

  CRITICAL INSTRUCTIONS:
  1. **SKILLS MATCHING**: Prioritize skills from the job description. If user has similar skills, use the exact JD terminology. Add relevant skills from user's profile that align with JD requirements.

  2. **EXPERIENCE TAILORING**: 
     - Keep the same titles, companies, and dates from user's profile
     - ONLY rewrite the responsibilities to match JD requirements with metrics
     - CRITICAL: Always include metrics and quantifiable achievements (e.g., "reduced latency by 40%", "increased sales by 25%", "improved efficiency by 50%", "managed team of 8 developers", "handled 10,000+ daily users")
     - Use strong action verbs (developed, implemented, optimized, increased, reduced, improved, managed, led)

  3. **PROJECTS OPTIMIZATION**:
     - Keep the same project titles from user's profile
     - ONLY rewrite the descriptions as bullet points using JD keywords and metrics
     - Each bullet point should be a separate achievement with quantifiable results
     - Include quantifiable results (e.g., "built app serving 5,000+ users", "reduced load time by 60%", "increased conversion rate by 30%")

  4. **SUMMARY CRAFTING**:
     - Create a compelling 50-100 word summary that directly addresses JD requirements
     - Include key JD skills and experience level
     - Highlight most relevant achievements

  5. **ACHIEVEMENTS ENHANCEMENT**:
     - Keep the same achievement titles from user's profile
     - Add descriptions that highlight JD-relevant skills with metrics

  6. **METRICS GENERATION**:
     - If user doesn't provide specific metrics, generate realistic, industry-appropriate numbers
     - Use common performance improvements (20-80% range for most optimizations)
     - Include scale indicators (team size, user count, data volume, budget, etc.)

  EXAMPLE TRANSFORMATIONS:
  
  User Experience: {{"title": "Software Engineer", "company": "Tech Corp", "startDate": "2020", "endDate": "2023", "responsibilities": ["Built web applications", "Improved performance"]}}
  Job Description: "React Developer with performance optimization experience"
  Generated Result: {{"title": "Software Engineer", "company": "Tech Corp", "startDate": "2020", "endDate": "2023", "responsibilities": ["Developed responsive web applications using React.js, reducing page load time by 40%", "Optimized application performance, improving user engagement by 25% for 10,000+ daily active users"]}}
  
  User Project: {{"title": "E-commerce Platform", "description": "Built a shopping website"}}
  Job Description: "Full-stack developer with database optimization skills"
  Generated Result: {{"title": "E-commerce Platform", "bullets": ["Built full-stack e-commerce platform serving 5,000+ users", "Optimized database queries reducing response time by 60%", "Implemented caching strategy improving overall performance by 45%"]}}

  METRICS EXAMPLES BY INDUSTRY:
  - Technology: "reduced latency by 40%", "increased user engagement by 25%", "handled 10,000+ daily users", "improved code coverage to 90%"
  - Marketing: "increased conversion rate by 35%", "grew social media following by 50%", "generated $2M in revenue", "reduced customer acquisition cost by 30%"
  - Sales: "exceeded quota by 120%", "closed deals worth $500K", "increased pipeline by 40%", "reduced sales cycle by 25%"
  - Operations: "improved efficiency by 45%", "reduced costs by $100K", "managed team of 12 employees", "increased productivity by 30%"
  - Healthcare: "reduced patient wait time by 35%", "improved patient satisfaction scores by 20%", "managed 200+ patient cases", "increased treatment success rate by 15%"

  JSON structure (ONLY generate these fields):
  {{
    "summary": "string (optional)",
    "skills": ["skill1", "skill2"],
    "experience": [
      {{
        "title": "string (keep from user profile)",
        "company": "string (keep from user profile)",
        "startDate": "string (keep from user profile)",
        "endDate": "string (keep from user profile)",
        "responsibilities": ["tailored responsibility with metrics", "tailored responsibility with metrics"]
      }}
    ],
    "projects": [
      {{
        "title": "string (keep from user profile)",
        "bullets": ["tailored bullet point with metrics", "tailored bullet point with metrics"]
      }}
    ],
    "achievements": [
      {{
        "title": "string (keep from user profile)",
        "description": "enhanced description with metrics (optional)",
        "issuedBy": "string (keep from user profile)"
      }}
    ]
  }}

  User Profile Data (JSON - only dynamic content):
  {profile}

  Job Description Requirements (JSON):
  {jobDescription}
`);

/* ----------------------------------------------------------------------------
 * Low-level LLM call (string out) + Zod validation
 * --------------------------------------------------------------------------*/

async function callModelString(promptText: string): Promise<string> {
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 1800,
  });

  // Use a simple one-turn user message
  const res = await model.invoke([{ role: "user", content: promptText }]);
  // For ChatOpenAI, content is string | Array; normalize to string
  const content =
    typeof res.content === "string"
      ? res.content
      : Array.isArray(res.content)
      ? res.content.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("\n")
      : String(res.content ?? "");
  return content;
}

/* ----------------------------------------------------------------------------
 * Public: Extractor
 * --------------------------------------------------------------------------*/

export async function extractProfileDataWithLangChain(text: string) {
  try {
    const trimmed = smartTrimResume(text, 35000);
    const formatted = await extractorPrompt.format({ resume_text: trimmed });
    const raw = await callModelString(formatted);

    const jsonText = extractJsonFromText(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      // Last-resort: try to fix common trailing commas
      const fixed = jsonText.replace(/,(\s*[}\]])/g, "$1");
      parsed = JSON.parse(fixed);
    }

    const safe = ExtractorSchema.safeParse(parsed);
    if (!safe.success) {
      console.warn("ExtractorSchema validation failed:", safe.error.flatten());
      throw new Error("Invalid extractor JSON");
    }
    const p = safe.data;

    // normalize return to a stable shape
    return {
      fullName: p.fullName ?? "",
      email: p.email ?? "",
      phone: p.phone ?? "",
      location: p.location ?? "",
      linkedIn: p.linkedIn ?? "",
      portfolio: p.portfolio ?? "",
      jobTitle: p.jobTitle ?? "",
      pronouns: p.pronouns ?? "",
      experience: Array.isArray(p.experience) ? p.experience : [],
      education: Array.isArray(p.education) ? p.education : [],
      skills: Array.isArray(p.skills) ? p.skills : [],
      summary: p.summary ?? "",
    };
  } catch (err) {
    console.error("LLM extraction failed:", err);
    return {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      portfolio: "",
      jobTitle: "",
      pronouns: "",
      experience: [],
      education: [],
      skills: [],
      summary: "",
    };
  }
}

/* ----------------------------------------------------------------------------
 * Public: Generate Resume
 * --------------------------------------------------------------------------*/

function defaultResumeContent(
  user: { name: string | null; email: string },
  personalInfo?: { 
    fullName: string | null; 
    phone: string | null; 
    location: string | null; 
    linkedIn: string | null; 
    portfolio: string | null; 
    jobTitle: string | null; 
    pronouns: string | null; 
  } | null
): ResumeContent {
  return {
    header: {
      name: personalInfo?.fullName || user.name || "Unknown",
      email: user.email || "user@example.com",
      phone: personalInfo?.phone || "",
      linkedIn: personalInfo?.linkedIn || "",
      portfolio: personalInfo?.portfolio || "",
      summary: "Professional with relevant skills and experience.",
    },
    skills: [],
    experience: [],
    education: [],
    projects: [],
    achievements: [],
  };
}

export const generateResume = async (
  userId: string,
  jobDescriptionId?: string
): Promise<ResumeContent> => {
  // Fetch or create profile shell
  let profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true, skills: true, experience: true, education: true, projects: true, achievements: true },
  });

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
      select: { id: true, skills: true, experience: true, education: true, projects: true, achievements: true },
    });
  }

  // User details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  if (!user) throw new Error("User not found");

  // Personal information
  const personalInfo = await prisma.personalInformation.findUnique({
    where: { profileId: profile.id },
    select: { 
      fullName: true, 
      phone: true, 
      location: true, 
      linkedIn: true, 
      portfolio: true, 
      jobTitle: true, 
      pronouns: true 
    },
  });

  // Job description
  let jobDescription: { parsedData: unknown } | null = null;
  if (jobDescriptionId) {
    jobDescription = await prisma.jobDescription.findUnique({
      where: { id: jobDescriptionId },
      select: { parsedData: true },
    });
    if (!jobDescription) throw new Error("Job description not found");
  }

  // Normalize JSON fields from profile
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const education = Array.isArray(profile.education) ? profile.education : [];
  const projects = Array.isArray(profile.projects) ? profile.projects : [];
  const achievements = Array.isArray(profile.achievements) ? profile.achievements : [];

  // Normalize skills to string[]
  const skills: string[] = Array.isArray(profile.skills)
    ? (profile.skills as any[])
        .map((skill) => {
          if (typeof skill === "string") return skill;
          if (skill && typeof skill === "object" && "name" in skill) return (skill as any).name as string;
          return null;
        })
        .filter(Boolean) as string[]
    : [];

  // Start with sensible defaults
  let resumeContent: ResumeContent = {
    ...defaultResumeContent(user, personalInfo),
    skills,
    experience: experience as any,
    education: education as any,
    projects: projects as any,
    achievements: achievements as any,
  };

  try {
    // Prepare static content (user-provided, doesn't change)
    const staticContent = {
      header: {
        name: personalInfo?.fullName || user.name || "Unknown",
        email: user.email || "user@example.com",
        phone: personalInfo?.phone || "",
        linkedIn: personalInfo?.linkedIn || "",
        portfolio: personalInfo?.portfolio || "",
      },
      education: education as any, // Education is static
    };

    // Prepare dynamic content data for AI generation (NO personal info)
    const dynamicContentData = {
      skills: resumeContent.skills,
      experience: resumeContent.experience,
      projects: resumeContent.projects,
      achievements: resumeContent.achievements,
    };

    const jobData = jobDescription ? jobDescription.parsedData ?? {} : {};

    // Log the data being sent to the AI for debugging
    console.log('=== RESUME GENERATION DEBUG ===');
    console.log('Static Content (not sent to AI):', JSON.stringify(staticContent, null, 2));
    console.log('Dynamic Content Data (sent to AI):', JSON.stringify(dynamicContentData, null, 2));
    console.log('Job Description Data:', JSON.stringify(jobData, null, 2));
    console.log('================================');

    const formatted = await generationPrompt.format({
      profile: JSON.stringify(dynamicContentData),
      jobDescription: JSON.stringify(jobData),
    });

    const raw = await callModelString(formatted);
    const jsonText = extractJsonFromText(raw);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      const fixed = jsonText.replace(/,(\s*[}\]])/g, "$1");
      parsed = JSON.parse(fixed);
    }

    const safe = DynamicResumeContentSchema.safeParse(parsed);
    if (safe.success) {
      const dynamicContent = safe.data;
      
      // Merge static and dynamic content
      resumeContent = {
        ...staticContent,
        ...dynamicContent,
        education: staticContent.education, // Keep static education
        header: {
          ...staticContent.header,
          summary: dynamicContent.summary, // Add AI-generated summary to header
        },
      };
      
      console.log('=== GENERATED RESUME CONTENT ===');
      console.log('Static Content:', JSON.stringify(staticContent, null, 2));
      console.log('Dynamic Content:', JSON.stringify(dynamicContent, null, 2));
      console.log('Final Merged Resume:', JSON.stringify(resumeContent, null, 2));
      console.log('================================');
    } else {
      console.warn("DynamicResumeContentSchema validation failed:", safe.error.flatten());
    }
  } catch (error) {
    console.error("Resume generation failed:", error);
  }

  // Ensure email is properly set
  if (!resumeContent.header.email || resumeContent.header.email.trim() === '') {
    resumeContent.header.email = user.email || "user@example.com";
  }

  return resumeContent;
};
