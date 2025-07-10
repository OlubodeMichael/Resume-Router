import { prisma } from "../../lib/prisma";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

interface ParsedData {
  skills: string[];
  responsibilities: string[];
  questions: string[];
}

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  temperature: 0.3,
});

export const ResumeService = {
  async generateResume(userId: string, jobDescriptionId: string) {
    const job = await prisma.jobDescription.findUnique({
      where: { id: jobDescriptionId },
    });

    if (!job || !job.parsedData) {
      throw new Error("Job description not found or not parsed");
    }

    const parsed = job.parsedData as unknown as ParsedData;

    const [experiences, skills, education] = await Promise.all([
      prisma.experience.findMany({ where: { userId } }),
      prisma.skill.findMany({ where: { userId } }),
      prisma.education.findMany({ where: { userId } }),
    ]);

    const formattedEducation = education
      .map(
        (e) =>
          `- ${e.degree} in ${e.fieldOfStudy || ""} from ${e.school} (${e.startDate.toISOString().split("T")[0]} - ${
            e.endDate?.toISOString().split("T")[0] || "Present"})`
      )
      .join("\n");

    const formattedSkills = skills
      .flatMap((s) => {
        const data = s.metadata as { categories: Record<string, string[]> };
        return Object.values(data.categories || {}).flat();
      })
      .join(", ");

    const prompt = PromptTemplate.fromTemplate(`
You're a resume expert. Given the job description and ONE of the user's past roles, generate 2–3 tailored bullet points using ATS-friendly, results-focused language.

Each bullet point should follow this format:
- [Strong action verb] [what you did] [measurable result or impact]

Job Keywords:
{keywords}

Job Responsibilities:
{responsibilities}

Resume Questions:
{questions}

User Experience:
- Title: {title}
- Company: {company}
- Duration: {startDate} to {endDate}
- Description: {description}
- Responsibilities:
{userResponsibilities}

User Skills:
{userSkills}

Education:
{education}
    `);

    const generatedBullets: string[] = [];

    for (const exp of experiences) {
      const experiencePrompt = await prompt
        .pipe(llm)
        .pipe(new StringOutputParser())
        .invoke({
          keywords: parsed.skills.join(", "),
          responsibilities: parsed.responsibilities.join("\n"),
          questions: parsed.questions.join("\n"),
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate.toISOString().split("T")[0],
          endDate: exp.endDate?.toISOString().split("T")[0] || "Present",
          description: exp.description || "",
          userResponsibilities: Array.isArray(exp.responsibilities)
            ? (exp.responsibilities as string[]).join("\n")
            : "",
          userSkills: formattedSkills,
          education: formattedEducation,
        });

      generatedBullets.push(experiencePrompt);
    }

    const aiText = generatedBullets.join("\n\n");

    const generatedResume = await prisma.resume.create({
      data: {
        userId,
        jobDescriptionId,
        template: "ai",
        outputFormat: "text",
        aiGeneratedText: aiText,
      },
    });

    return generatedResume;
  },
};
