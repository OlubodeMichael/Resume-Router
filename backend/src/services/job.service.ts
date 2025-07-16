import { prisma } from "../../lib/prisma";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { llm } from "../../lib/langchain";
import { JobDescriptionData } from "../../schemas/jobDescription.schema";

const prompt = PromptTemplate.fromTemplate(`
Extract the following information from the job description, suitable for any industry (e.g., tech, healthcare, marketing, education).

Return ONLY a valid JSON object with the following structure:
{{
  "skills": ["skill1", "skill2"],
  "experienceLevel": "experience level",
  "responsibilities": ["responsibility1", "responsibility2"]
}}

Examples:
1. Job Description: "Marketing Manager needed with 5+ years of experience in digital marketing. Must be skilled in SEO, content creation, and team leadership. Responsibilities include developing campaigns and analyzing performance metrics."
Output: {{ "skills": ["SEO", "Content Creation", "Team Leadership"], "experienceLevel": "5+ years", "responsibilities": ["Develop campaigns", "Analyze performance metrics"] }}

2. Job Description: "Registered Nurse with 2 years of experience in patient care. Must have CPR certification and strong communication skills. Duties include administering medications and coordinating with doctors."
Output: {{ "skills": ["CPR Certification", "Communication", "Patient Care"], "experienceLevel": "2 years", "responsibilities": ["Administer medications", "Coordinate with doctors"] }}

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
    };
  } catch (error) {
    console.error('LangChain parsing failed:', error);
  }

  return parsedData;
};