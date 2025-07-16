import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import { generateResume } from '../services/resume.service';

// Create Resume
export const createResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { jobDescriptionId } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  // Generate resume content
  const content = await generateResume(userId, jobDescriptionId);

  // Save to database
  const resume = await prisma.resume.create({
    data: {
      userId,
      jobDescriptionId: jobDescriptionId || null,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  res.status(201).json({
    message: 'Resume created successfully',
    resume,
  });
});

// Get All Resumes for User
export const getResumes = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    message: 'Resumes fetched successfully',
    resumes,
  });
});

// Get Single Resume
export const getResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const resume = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!resume) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }

  res.status(200).json({
    message: 'Resume fetched successfully',
    resume,
  });
});

// Delete Resume
export const deleteResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const resume = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!resume) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }

  await prisma.resume.delete({
    where: { id },
  });

  res.status(200).json({
    message: 'Resume deleted successfully',
  });
});