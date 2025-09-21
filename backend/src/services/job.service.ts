import { prisma } from "../../lib/prisma";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { llm } from "../../lib/langchain";
import { JobDescriptionData } from "../../schemas/jobDescription.schema";

const prompt = PromptTemplate.fromTemplate(`
Extract comprehensive information from the job description to help tailor a resume effectively.

Return ONLY a valid JSON object with the following structure:
{{
  "skills": ["skill1", "skill2"],
  "experienceLevel": "experience level",
  "responsibilities": ["responsibility1", "responsibility2"],
  "technologies": ["tech1", "tech2"],
  "qualifications": ["qualification1", "qualification2"],
  "industry": "industry type",
  "jobTitle": "job title"
}}

Extraction Guidelines:
- Extract ALL technical skills, soft skills, and tools mentioned
- Identify specific technologies, frameworks, and software
- Capture key responsibilities and duties
- Note required qualifications and certifications
- Determine the industry and job level
- Include both explicit and implicit requirements

Examples:
1. Job Description: "Senior React Developer needed with 5+ years of experience in frontend development. Must be skilled in React.js, Redux, TypeScript, and have experience with RESTful APIs. Responsibilities include building scalable web applications, code reviews, and mentoring junior developers. Experience with AWS and CI/CD pipelines preferred."
Output: {{ 
  "skills": ["React.js", "Redux", "TypeScript", "Frontend Development", "Code Reviews", "Mentoring"], 
  "experienceLevel": "5+ years", 
  "responsibilities": ["Build scalable web applications", "Conduct code reviews", "Mentor junior developers"],
  "technologies": ["React.js", "Redux", "TypeScript", "RESTful APIs", "AWS", "CI/CD"],
  "qualifications": ["Senior level", "5+ years experience"],
  "industry": "Technology",
  "jobTitle": "Senior React Developer"
}}

2. Job Description: "Marketing Manager with 3+ years of experience in digital marketing. Must have expertise in SEO, Google Analytics, content creation, and team leadership. Responsibilities include developing marketing campaigns, analyzing performance metrics, and managing social media presence."
Output: {{ 
  "skills": ["SEO", "Google Analytics", "Content Creation", "Team Leadership", "Social Media Management"], 
  "experienceLevel": "3+ years", 
  "responsibilities": ["Develop marketing campaigns", "Analyze performance metrics", "Manage social media presence"],
  "technologies": ["Google Analytics", "SEO tools", "Social Media Platforms"],
  "qualifications": ["3+ years experience", "Digital marketing expertise"],
  "industry": "Marketing",
  "jobTitle": "Marketing Manager"
}}

Job Description:
{content}
`);

export const parseJobDescription = async (content: string): Promise<JobDescriptionData> => {
  if (!content || typeof content !== 'string') {
    throw new Error('Content is required and must be a string');
  }

  let parsedData: JobDescriptionData = {
    skills: [],
    experienceLevel: 'Unknown',
    responsibilities: [],
    technologies: [],
    qualifications: [],
    industry: 'Unknown',
    jobTitle: 'Unknown',
  };

  try {
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const result = await chain.invoke({ content });
    
    // Parse the JSON response
    const parsed = JSON.parse(result);
    parsedData = {
      skills: parsed.skills || [],
      experienceLevel: parsed.experienceLevel || 'Unknown',
      responsibilities: parsed.responsibilities || [],
      technologies: parsed.technologies || [],
      qualifications: parsed.qualifications || [],
      industry: parsed.industry || 'Unknown',
      jobTitle: parsed.jobTitle || 'Unknown',
    };
  } catch (error) {
    console.error('LangChain parsing failed:', error);
  }

  return parsedData;
};