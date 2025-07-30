import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import { generateResume } from '../services/resume.service';
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs/promises";
import * as fsSync from "fs";
import { extractProfileDataWithLangChain } from '../services/resume.service';
import AppError from '../../utils/appError';

// Extend Express Request to include file property
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Stream-based PDF parsing function
async function parsePdfStream(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = fsSync.createReadStream(filePath);
    const chunks: Buffer[] = [];
    
    stream.on("data", (chunk: string | Buffer) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
        // Limit memory usage by checking chunk size
        if (chunks.length > 100) { // Limit to 100 chunks
          stream.destroy();
          reject(new Error("File too large for processing"));
          return;
        }
      }
    });
    
    stream.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const data = await pdfParse(buffer);
        // Clear chunks array to free memory
        chunks.length = 0;
        resolve(data.text);
      } catch (error) {
        reject(error);
      }
    });
    
    stream.on("error", (error) => {
      reject(error);
    });
  });
}

// Stream-based DOCX parsing function
async function parseDocxStream(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = fsSync.createReadStream(filePath);
    const chunks: Buffer[] = [];
    
    stream.on("data", (chunk: string | Buffer) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
        // Limit memory usage by checking chunk size
        if (chunks.length > 100) { // Limit to 100 chunks
          stream.destroy();
          reject(new Error("File too large for processing"));
          return;
        }
      }
    });
    
    stream.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const result = await mammoth.extractRawText({ buffer });
        // Clear chunks array to free memory
        chunks.length = 0;
        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    });
    
    stream.on("error", (error) => {
      reject(error);
    });
  });
}


// Create Resume
export const createResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
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
  const userId = (req.user as any)?.id;

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
  const userId = (req.user as any)?.id;
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
  const userId = (req.user as any)?.id;
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



// Parse Resume
export const parseResume = catchAsync(async (req: RequestWithFile, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const file = req.file;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!file) {
    res.status(400).json({ message: "Resume file is required" });
    return;
  }

  try {
    let text = "";
    
    // Check file size before processing (limit to 10MB)
    const stats = await fs.stat(file.path);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > 10) {
      res.status(400).json({ message: "File size too large. Please upload a file smaller than 10MB." });
      return;
    }

    // Use stream-based parsing for memory efficiency
    if (file.mimetype === "application/pdf") {
      text = await parsePdfStream(file.path);
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      text = await parseDocxStream(file.path);
    } else {
      res.status(400).json({ message: "Unsupported file type" });
      return;
    }

    // Clean up uploaded file immediately after parsing
    await fs.unlink(file.path).catch(err => console.error('Error deleting file:', err));

    // Extract data with LangChain and return as JSON
    const profileData = await extractProfileDataWithLangChain(text);

    // Clear text from memory after processing
    text = "";

    res.status(200).json({ message: "Resume processed successfully", data: profileData });
  } catch (error) {
    console.error("Upload error:", error);
    
    // Clean up uploaded file on error
    if (file.path) {
      await fs.unlink(file.path).catch(err => console.error('Error deleting file:', err));
    }
    
    res.status(500).json({ message: "Failed to process resume" });
  }
});

