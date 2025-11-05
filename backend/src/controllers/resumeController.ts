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
import { processResumeAsync } from '../../utils/worker';
import { $Enums } from '@prisma/client';
import { createDraftAndStart } from '../services/resumeDraft.service';

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
// POST /api/resumes
export const createResume = catchAsync(async (req, res) => {
  const userId = (req.user as any)?.id as string | undefined;
  const { jd, tone = "neutral", template }: { jd?: string; tone?: string; template?: string } = req.body || {};

  if (!userId) return void res.status(401).json({ message: "User not authenticated" });
  if ((!jd || typeof jd !== "string" || jd.trim().length < 30) && !template) {
    return void res.status(400).json({ message: "Provide a valid job description (≥ 30 chars) or a template." });
  }

  const resumeId = await createDraftAndStart({
    userId,
    jd: jd ?? "",
    template,
    tone,
  });

  res.status(201).json({ resumeId, status: "processing" });
});


export const tailorResume = catchAsync(async (req, res) => {
  const userId = (req.user as any)?.id as string | undefined;
  const { id } = req.params as { id: string };
  const { jd, tone = "neutral" } = (req.body ?? {}) as { jd?: string; tone?: string };

  if (!userId) return void res.status(401).json({ message: "User not authenticated" });

  const exists = await prisma.resume.findFirst({ where: { id, userId }, select: { id: true } });
  if (!exists) return void res.status(404).json({ message: "Resume not found" });

  await prisma.resume.update({
    where: { id },
    data: {
      status: $Enums.ResumeStatus.processing,
      ...(typeof jd === "string" ? { jdRaw: jd } : {}),
      errorMessage: null,
    },
  });

  // reuse worker directly (no need to create a new draft)
  void processResumeAsync({
    resumeId: id,
    userId,
    jd: jd ?? "",
    tone,
  });

  res.status(200).json({ status: "processing" });
});

export const getResumeStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id as string | undefined;
  const { id } = req.params as { id: string };

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  const resume = await prisma.resume.findFirst({
    where: { id, userId },
    select: { status: true },
  });

  if (!resume) {
    res.status(404).json({ message: "Resume not found" });
    return;
  }

  res.status(200).json({ status: resume.status });
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
    select: { id: true, createdAt: true, updatedAt: true, status: true, title: true},
  });

  // Format dates to ISO string
  const formattedResumes = resumes.map(resume => ({
    ...resume,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  }));

  res.status(200).json({
    message: 'Resumes fetched successfully',
    resumes: formattedResumes,
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
    where: { 
      id, 
      userId }, 
      
  });

  if (!resume) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }

  // Format dates to ISO string
  const formattedResume = {
    ...resume,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  };

  res.status(200).json({
    message: 'Resume fetched successfully',
    resume: formattedResume,
  });
});

// Update Resume Content
export const updateResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { id } = req.params;
  const { content, lastEditedAt } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!content) {
    res.status(400).json({ message: 'Content is required' });
    return;
  }

  // Verify resume exists and belongs to user
  const resume = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!resume) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }

  console.log('Updating resume content:', { resumeId: id, contentKeys: Object.keys(content || {}) });

  // Update resume content with new JSON
  await prisma.resume.update({
    where: { id },
    data: {
      content: content as any, // JSON content with styling preserved
      updatedAt: new Date(),
    },
  });

  console.log('Resume content saved successfully:', { resumeId: id });

  res.status(200).json({
    message: 'Resume updated successfully',
    updatedAt: new Date().toISOString(),
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
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to process resume';
    res.status(500).json({ 
      message: "Failed to process resume",
      error: errorMessage 
    });
  }
});


/*
export const setTemplateId = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id as string | undefined;
  const { resumeId } = req.params as { resumeId: string };
  const { templateId } = req.body as { templateId?: string };

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }
  if (!templateId) {
    res.status(400).json({ message: 'templateId is required' });
    return;
  }

  // single write + ownership enforcement
  const { count } = await prisma.resume.updateMany({
    where: { id: resumeId, userId },
    data: { templateId: templateId as any }, 
  });

  if (count === 0) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }

  res.status(200).json({ templateId });
});

export const getTemplateId = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id as string | undefined;
  const { resumeId } = req.params as { resumeId: string };

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    select: { templateId: true },
  });

  if (!resume) {
    res.status(404).json({ message: 'Resume not found' });
    return;
  }

  res.status(200).json({ templateId: resume.templateId ?? null });
});
*/

export const resumeStream = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const send = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // push current status immediately
  const first = await prisma.resume.findUnique({
    where: { id },
    select: { status: true, errorMessage: true, updatedAt: true },
  });
  if (!first) {
    send("error", { message: "not_found" });
    res.end();
    return;
  }
  send("status", first);

  // simple server-side polling loop (backend reads DB, frontend does NOT)
  const interval = setInterval(async () => {
    try {
      const r = await prisma.resume.findUnique({
        where: { id },
        select: { status: true, errorMessage: true, updatedAt: true },
      });
      if (!r) {
        send("error", { message: "not_found" });
        clearInterval(interval);
        res.end();
        return;
      }
      send("status", r);
      if (r.status === "ready" || r.status === "failed") {
        send("complete", r);
        clearInterval(interval);
        res.end();
        return;
      }
    } catch {
      send("error", { message: "db_error" });
      clearInterval(interval);
      res.end();
    }
  }, 1000);

  // keep-alive ping for proxies
  const ping = setInterval(() => send("ping", Date.now()), 100000);

  // cleanup on client disconnect
  req.on("close", () => {
    clearInterval(interval);
    clearInterval(ping);
  });
})