import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import { parseJobDescription } from '../services/job.service';

// Create Job Description
export const createJobDescription = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { content } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!content || typeof content !== 'string') {
    res.status(400).json({ message: 'Content is required and must be a string' });
    return;
  }

  // Parse job description using service
  const parsedData = await parseJobDescription(content);

  // Save to database
  const jobDescription = await prisma.jobDescription.create({
    data: {
      userId,
      content,
      parsedData,
      createdAt: new Date(),
    },
  });

  res.status(201).json({
    message: 'Job description created successfully',
    jobDescription,
  });
});

// Get All Job Descriptions for User
export const getJobDescriptions = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const jobDescriptions = await prisma.jobDescription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    message: 'Job descriptions fetched successfully',
    jobDescriptions,
  });
});

// Get Single Job Description
export const getJobDescription = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
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

  res.status(200).json({
    message: 'Job description fetched successfully',
    jobDescription,
  });
});

// Delete Job Description
export const deleteJobDescription = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
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