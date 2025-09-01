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

// Final resume JSON shape
export const ResumeContentSchema = z.object({
  header: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
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
        description: z.string(),
      })
    )
    .default([]),
  achievements: z
    .array(
      z.object({
        title: z.string(),
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
  Generate a tailored resume based on the user's profile and job description.
  Output ONLY valid JSON matching the provided structure.

  Instructions:
  - Align user's skills/experience/education/projects/achievements to the JD keywords and responsibilities.
  - Rephrase responsibilities with action verbs and measurable outcomes when possible.
  - Prefer exact JD keywords (ATS-friendly); include synonyms when helpful.
  - Keep summary concise (50–100 words).
  - Use empty arrays if data is missing; keep schema valid.

  JSON structure:
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

  User Profile (JSON):
  {profile}

  Job Description Parsed Data (JSON):
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

function defaultResumeContent(user: { name: string | null; email: string }): ResumeContent {
  return {
    header: {
      name: user.name || "Unknown",
      email: user.email,
      phone: "",
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
    select: { skills: true, experience: true, education: true, projects: true, achievements: true },
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
      select: { skills: true, experience: true, education: true, projects: true, achievements: true },
    });
  }

  // User details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  if (!user) throw new Error("User not found");

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
    ...defaultResumeContent(user),
    skills,
    experience: experience as any,
    education: education as any,
    projects: projects as any,
    achievements: achievements as any,
  };

  try {
    const formatted = await generationPrompt.format({
      profile: JSON.stringify({
        skills: resumeContent.skills,
        experience: resumeContent.experience,
        education: resumeContent.education,
        projects: resumeContent.projects,
        achievements: resumeContent.achievements,
      }),
      jobDescription: jobDescription ? JSON.stringify(jobDescription.parsedData ?? {}) : "{}",
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

    const safe = ResumeContentSchema.safeParse(parsed);
    if (safe.success) {
      const ai = safe.data;
      // Merge with defaults to preserve required header/email/name if omitted
      resumeContent = {
        ...resumeContent,
        ...ai,
        header: { ...resumeContent.header, ...ai.header },
      };
    } else {
      console.warn("ResumeContentSchema validation failed:", safe.error.flatten());
    }
  } catch (error) {
    console.error("Resume generation failed:", error);
  }

  return resumeContent;
};
