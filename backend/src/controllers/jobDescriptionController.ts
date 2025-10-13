import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import { parseJobDescription } from '../services/job.service';
import { createDraftAndStart } from '../services/resumeDraft.service';

// Create Job Description
export const createJobDescription = catchAsync(async (req, res) => {
  const userId = (req.user as any)?.id as string | undefined;
  const { content, tone = "neutral", template }: { content?: string; tone?: string; template?: string } = req.body || {};

  if (!userId) return void res.status(401).json({ message: "User not authenticated" });
  if (!content || typeof content !== "string" || content.trim().length < 30) {
    console.log(content)
    return void res.status(400).json({ message: "Content is required and must be a string ≥ 30 chars" });
  }

  // 1) parse
  const parsedData = await parseJobDescription(content);

  // 2) save JD
  const jd = await prisma.jobDescription.create({
    data: { userId, content, parsedData },
    select: { id: true, createdAt: true, updatedAt: true },
  });

  // 3) create resume draft + start async processing (link to this JD)
  const resumeId = await createDraftAndStart({
    userId,
    jd: content,  // Pass the actual job description content for jdRaw field
    template,           // enum key if provided
    jobDescriptionId: jd.id,
    tone,               // transient
  });

  // 4) respond with both ids and formatted dates
  res.status(201).json({
    message: "Job description created; resume generation started",
    jobDescriptionId: jd.id,
    resumeId,
    status: "processing",
    createdAt: jd.createdAt.toISOString(),
    updatedAt: jd.updatedAt.toISOString(),
  });
});


// Get All Job Descriptions for User
export const getJobDescriptions = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const jobDescriptions = await prisma.jobDescription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Format dates to ISO string in local timezone
  const formattedJobDescriptions = jobDescriptions.map(jd => ({
    ...jd,
    createdAt: jd.createdAt.toISOString(),
    updatedAt: jd.updatedAt.toISOString(),
  }));

  res.status(200).json({
    message: 'Job descriptions fetched successfully',
    jobDescriptions: formattedJobDescriptions,
  });
});

// Get Single Job Description
export const getJobDescription = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const jobDescription = await prisma.jobDescription.findFirst({
    where: { id, userId },
  });

  if (!jobDescription) {
    res.status(404).json({ message: 'Job description not found' });
    return;
  }

  // Format dates to ISO string
  const formattedJobDescription = {
    ...jobDescription,
    createdAt: jobDescription.createdAt.toISOString(),
    updatedAt: jobDescription.updatedAt.toISOString(),
  };

  res.status(200).json({
    message: 'Job description fetched successfully',
    jobDescription: formattedJobDescription,
  });
});

// Delete Job Description
export const deleteJobDescription = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const jobDescription = await prisma.jobDescription.findFirst({
    where: { id, userId },
  });

  if (!jobDescription) {
    res.status(404).json({ message: 'Job description not found' });
    return;
  }

  await prisma.jobDescription.delete({
    where: { id },
  });

  res.status(200).json({
    message: 'Job description deleted successfully',
  });
});