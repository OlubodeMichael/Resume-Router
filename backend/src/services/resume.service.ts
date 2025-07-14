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
You are a resume AI assistant.

Based on the user's experience and a target job description, generate a structured JSON object.

Each job experience should return:
- jobTitle
- company
- bullets (3-4 resume bullet points, written in ATS-friendly language)

Use the job description and skills to tailor each bullet to match the role.
make a full sentence for each bullet. adding terminologies and concepts that are relevant to the job description.

Return your output in **valid JSON only**. No extra commentary.

Format:
{{
  "sections": [
    {{
      "jobTitle": "Frontend Developer",
      "company": "PixelCraft Inc",
      "bullets": [
        "Built 20+ scalable UI components using React and Tailwind CSS, reducing load times by 30%",
        "Collaborated with backend engineers to integrate REST APIs",
        "Optimized performance with lazy loading and memoization"
      ]
    }}
  ]
}}

Job Description Keywords:
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

    const generatedSections: any[] = [];

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

      const parsedJson = JSON.parse(experiencePrompt);
      if (parsedJson.sections && Array.isArray(parsedJson.sections)) {
        generatedSections.push(...parsedJson.sections);
      }
    }

    const jsonData = { sections: generatedSections };

    const generatedResume = await prisma.resume.create({
      data: {
        userId,
        jobDescriptionId,
        template: "ai",
        outputFormat: "json",
        aiGeneratedText: null,
        jsonData,
      },
    });

    return generatedResume;
  },
};
