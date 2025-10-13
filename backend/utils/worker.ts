// utils/worker.ts
import { prisma } from "../lib/prisma";
import { $Enums } from "@prisma/client";
import { generateResume } from "../src/services/resume.service";

type ProcessArgs = {
  resumeId: string;
  userId: string;
  jd: string;            // raw job description text
  tone: string;
  templateId?: string;   // optional
};

// simple timeout wrapper
async function withTimeout<T>(p: Promise<T>, ms = 60_000, label = "job") {
  let to: NodeJS.Timeout;
  return await Promise.race<T>([
    p,
    new Promise<T>((_, rej) => (to = setTimeout(() => rej(new Error(`${label} timed out`)), ms))),
  ]).finally(() => clearTimeout(to!));
}

export async function processResumeAsync(args: ProcessArgs) {
  const { resumeId, userId, jd, tone, templateId } = args;

  // 1) mark as processing (idempotent)
  await prisma.resume.update({
    where: { id: resumeId },
    data: { status: $Enums.ResumeStatus.processing, errorMessage: null },
  }).catch(() => {});

  try {
    // 2) Get the jobDescriptionId from the resume record
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { jobDescriptionId: true },
    });
    
    const jobDescriptionId = resume?.jobDescriptionId || undefined;

    // 3) Call your existing generator (adapt signature if it supports templateId)
    // If your generateResume can accept templateId, thread it through.
    const content = await withTimeout(
      generateResume(userId, jobDescriptionId, tone /*, templateId*/),
      60_000,
      "generateResume"
    );

    // 4) persist content → ready
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        content,
        status: $Enums.ResumeStatus.ready,
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    const message = err?.message ?? String(err);
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        status: $Enums.ResumeStatus.failed,
        errorMessage: message.slice(0, 2000),
        updatedAt: new Date(),
      },
    }).catch(() => {});
    console.error("[processResumeAsync] failed:", message);
  }
}
