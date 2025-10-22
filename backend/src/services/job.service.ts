import { prisma } from "../../lib/prisma";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { llm } from "../../lib/langchain";
import { JobDescriptionData } from "../../schemas/jobDescription.schema";

/** --- light canonicalization helpers (kept inline to match your format) --- */
const CANON_MAP: Record<string, string> = {
  "reactjs": "React",
  "node": "Node.js",
  "nodejs": "Node.js",
  "postgres": "PostgreSQL",
  "postgress": "PostgreSQL",
  "ts": "TypeScript",
  "js": "JavaScript",
  "rest": "REST APIs",
  "restful apis": "REST APIs",
  "github actions": "GitHub Actions",
  "ci/cd": "CI/CD",
};

function canonicalize(list: string[] = []): string[] {
  const out = new Set<string>();
  for (const raw of list) {
    const s = (raw ?? "").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    out.add(CANON_MAP[key] ?? s);
  }
  return [...out];
}

function dedupe(list: string[] = []): string[] {
  return [...new Set(list.filter(Boolean).map(s => s.trim()))];
}

/** --- upgraded prompt (same format; adds richer fields that won’t break your parser) --- */
const prompt = PromptTemplate.fromTemplate(`
Extract comprehensive information from the job description to help tailor a resume effectively.

Return ONLY a valid JSON object with the following structure (you may include the extra optional fields shown after the required ones):
{{
  "skills": ["skill1", "skill2"],                     // REQUIRED (mixed: hard + soft, prioritized)
  "experienceLevel": "experience level",              // REQUIRED (e.g., "Entry", "Mid", "Senior", "5+ years")
  "responsibilities": ["responsibility1", "responsibility2"],   // REQUIRED
  "technologies": ["tech1", "tech2"],                 // REQUIRED (named stacks/tools)
  "qualifications": ["qualification1", "qualification2"],       // REQUIRED
  "industry": "industry type",                        // REQUIRED
  "jobTitle": "job title",                            // REQUIRED

  "hardSkills": ["string"],                           // OPTIONAL (technical abilities, tooling, methods)
  "softSkills": ["string"],                           // OPTIONAL (communication, ownership, leadership, etc.)
  "atsKeywords": ["string"],                          // OPTIONAL (exact phrases recruiters/ATS search)
  "employmentType": "Full-time|Part-time|Contract|Internship|Temporary|Unknown", // OPTIONAL
  "remotePolicy": "Onsite|Hybrid|Remote|Flexible|Unknown",      // OPTIONAL
  "location": "city, state/country (if specified)",  // OPTIONAL
  "yearsExperienceMin": 0,                           // OPTIONAL integer if derivable
  "yearsExperienceMax": 0                            // OPTIONAL integer if derivable
}}

Extraction Guidelines:
- Separate SKILLS into:
  * hardSkills (technical/tools/platforms/languages/databases/cloud/methods)
  * softSkills (communication, collaboration, ownership, stakeholder mgmt, problem-solving, leadership, etc.)
  Also include a combined, prioritized "skills" list for backward compatibility (mix of hard+soft).
- "technologies" is reserved for named stacks/tools (e.g., React, Node.js, Express.js, PostgreSQL, AWS, Docker, Kubernetes).
- Identify responsibilities/duties as short, scannable phrases (start with a verb).
- Qualifications: degrees, certs, years of experience, security clearances, legal/visa requirements, etc.
- Derive: jobTitle, industry, experienceLevel (or concrete "3+ years"), employmentType (if stated), remotePolicy (Onsite/Hybrid/Remote), location (if stated).
- Include both explicit and reasonable implicit requirements; do NOT hallucinate vendors or stacks that aren’t present.
- Populate "atsKeywords" with exact phrases from the JD worth matching (e.g., "REST APIs", "CI/CD", "Design for Manufacturability (DFM)", "PLC programming").

Normalization Rules (apply to skills/technologies/keywords):
- Prefer exact JD phrasing when possible.
- Normalize obvious synonyms:
  - ReactJS -> React
  - Node, NodeJS -> Node.js
  - Postgres -> PostgreSQL
  - REST, RESTful APIs -> REST APIs
  - GitHub actions -> GitHub Actions
  - CI/CD variants -> CI/CD

Examples:
1. Job Description: "Senior React Developer needed with 5+ years of experience in frontend development. Must be skilled in React.js, Redux, TypeScript, and have experience with RESTful APIs. Responsibilities include building scalable web applications, code reviews, and mentoring junior developers. Experience with AWS and CI/CD pipelines preferred."
Output: {{
  "skills": ["React", "Redux", "TypeScript", "Frontend Development", "Code Reviews", "Mentoring", "REST APIs", "CI/CD", "AWS"],
  "experienceLevel": "5+ years",
  "responsibilities": ["Build scalable web applications", "Conduct code reviews", "Mentor junior developers"],
  "technologies": ["React", "Redux", "TypeScript", "REST APIs", "AWS", "CI/CD"],
  "qualifications": ["Senior level", "5+ years experience"],
  "industry": "Technology",
  "jobTitle": "Senior React Developer",
  "hardSkills": ["React", "Redux", "TypeScript", "REST APIs", "CI/CD", "AWS"],
  "softSkills": ["Mentoring", "Collaboration", "Communication"],
  "atsKeywords": ["React", "Redux", "TypeScript", "REST APIs", "CI/CD", "AWS"],
  "employmentType": "Unknown",
  "remotePolicy": "Unknown",
  "location": "Unknown",
  "yearsExperienceMin": 5
}}

2. Job Description: "Marketing Manager with 3+ years of experience in digital marketing. Must have expertise in SEO, Google Analytics, content creation, and team leadership. Responsibilities include developing marketing campaigns, analyzing performance metrics, and managing social media presence."
Output: {{
  "skills": ["SEO", "Google Analytics", "Content Creation", "Team Leadership", "Social Media Management", "Digital Marketing"],
  "experienceLevel": "3+ years",
  "responsibilities": ["Develop marketing campaigns", "Analyze performance metrics", "Manage social media presence"],
  "technologies": ["Google Analytics", "SEO tools", "Social Media Platforms"],
  "qualifications": ["3+ years experience", "Digital marketing expertise"],
  "industry": "Marketing",
  "jobTitle": "Marketing Manager",
  "hardSkills": ["SEO", "Google Analytics", "Content Strategy"],
  "softSkills": ["Team Leadership", "Communication"],
  "atsKeywords": ["SEO", "Google Analytics", "Content Creation", "Team Leadership", "Social Media Management"],
  "employmentType": "Unknown",
  "remotePolicy": "Unknown",
  "location": "Unknown",
  "yearsExperienceMin": 3
}}

Job Description:
{content}
`);

export const parseJobDescription = async (content: string): Promise<JobDescriptionData> => {
  if (!content || typeof content !== "string") {
    throw new Error("Content is required and must be a string");
  }

  let parsedData: JobDescriptionData = {
    skills: [],
    experienceLevel: "Unknown",
    responsibilities: [],
    technologies: [],
    qualifications: [],
    industry: "Unknown",
    jobTitle: "Unknown",
  };

  try {
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const result = await chain.invoke({ content });

    // --- Clean accidental code fences & trailing commas without changing your flow ---
    let cleaned = (result ?? "").trim();

    // Strip ```json ... ``` or ``` ... ```
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
    }

    // Remove trailing commas before } or ]
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    const raw = JSON.parse(cleaned);

    // Normalize + dedupe while preserving your original shape
    const skillsRaw: string[] = raw.skills ?? [];
    const techRaw: string[] = raw.technologies ?? [];
    const softRaw: string[] = raw.softSkills ?? [];
    const hardRaw: string[] = raw.hardSkills ?? [];

    const skills = dedupe(canonicalize(skillsRaw));
    const technologies = dedupe(canonicalize(techRaw));
    const softSkills = dedupe(canonicalize(softRaw));
    const hardSkills = dedupe(canonicalize(hardRaw));

    parsedData = {
      skills, // mixed (hard + soft) for backward compat
      experienceLevel: raw.experienceLevel || "Unknown",
      responsibilities: dedupe(raw.responsibilities ?? []),
      technologies,
      qualifications: dedupe(raw.qualifications ?? []),
      industry: raw.industry || "Unknown",
      jobTitle: raw.jobTitle || "Unknown",
    };

    // If you later extend JobDescriptionData, you can attach extras here:
    // (They'll be ignored safely by your current schema consumers.)
    (parsedData as any).__extras = {
      hardSkills,
      softSkills,
      atsKeywords: dedupe(canonicalize(raw.atsKeywords ?? [])),
      employmentType: raw.employmentType ?? "Unknown",
      remotePolicy: raw.remotePolicy ?? "Unknown",
      location: raw.location ?? undefined,
      yearsExperienceMin: Number.isInteger(raw.yearsExperienceMin) ? raw.yearsExperienceMin : undefined,
      yearsExperienceMax: Number.isInteger(raw.yearsExperienceMax) ? raw.yearsExperienceMax : undefined,
    };
  } catch (error) {
    console.error("LangChain parsing failed:", error);
  }

  return parsedData;
};
