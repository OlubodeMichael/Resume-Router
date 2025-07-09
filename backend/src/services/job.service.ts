import { prisma } from "../../lib/prisma";
import { JobDescriptionInput } from "../types";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";


const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-mini",
    temperature: 0.3,
  });


export const JobService = {
    async saveJobDescription(userId: string, jobDescription: JobDescriptionInput) {
    const job = await prisma.jobDescription.create({
        data: {
            userId,
            content: jobDescription.content,
            source: jobDescription.source,
        }
        })
        return job;
    },

    async parseJobDescription(jobId: string) {
        const job = await prisma.jobDescription.findUnique({
          where: { id: jobId },
        });
    
        if (!job) throw new Error("Job not found");
    
        const prompt = PromptTemplate.fromTemplate(`
            You are a helpful AI assistant that analyzes job descriptions and extracts structured data for resume tailoring.
            
            Your task is to analyze the following job description and return the result in **strict JSON format** with the following 3 keys:
            
            1. "skills" — an array of technologies, tools, or competencies (e.g., "React", "Git", "APIs")
            2. "responsibilities" — an array of work duties, tasks, or job requirements
            3. "questions" — 3–5 resume-enhancing prompts the candidate should answer (e.g., "Describe a time you optimized a frontend app.")
            
            ⚠️ Do **not** return explanations. Return only valid JSON. All 3 keys must be present.
            
            Format:
            {{
              "skills": [],
              "responsibilities": [],
              "questions": []
            }}
            
            Job Description:
            {jobDescription}
            `);
            
            
    
        const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    
        const result = await chain.invoke({
          jobDescription: job.content,
        });
    
        let parsed;
        try {
          parsed = JSON.parse(result);
        } catch (err) {
          throw new Error("Failed to parse AI output as JSON");
        }
    
        await prisma.jobDescription.update({
          where: { id: jobId },
          data: { parsedData: parsed },
        });
    
        return parsed;
      },
}