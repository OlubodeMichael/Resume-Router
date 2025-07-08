import { prisma } from "../../lib/prisma";
import { JobDescriptionInput } from "../types";




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
    }
}