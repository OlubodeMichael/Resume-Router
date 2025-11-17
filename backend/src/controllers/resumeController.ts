import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import { generateResume } from '../services/resume.service';
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs/promises";
import * as fsSync from "fs";
import { extractProfileDataWithLangChain } from '../services/resume.service';
import { mapExtractedProfileToProfile } from '../services/profileMapping.service';
import AppError from '../../utils/appError';
import { processResumeAsync } from '../../utils/worker';
import { $Enums } from '@prisma/client';
import { createDraftAndStart } from '../services/resumeDraft.service';
import { rdel } from '../../utils/rcache';

// Extend Express Request to include file property
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

const profileCacheKey = (userId: string) => `rr:v1:profile:${userId}`;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mergeCollections<T>(existing: T[], incoming: T[], keyFn: (item: T) => string) {
  const result = [...existing];
  const seen = new Set(existing.map((item) => keyFn(item)));
  let changed = false;

  incoming.forEach((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return;
    result.push(item);
    seen.add(key);
    changed = true;
  });

  return { merged: result, changed };
}

function mergeStringCollections(existing: unknown, incoming: string[]) {
  const existingArray = Array.isArray(existing) ? existing : [];
  const normalizedExisting = existingArray
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);

  const seen = new Set(normalizedExisting.map((value) => value.toLowerCase()));
  const merged = [...normalizedExisting];
  let changed = false;

  incoming.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) return;
    merged.push(trimmed);
    seen.add(lower);
    changed = true;
  });

  return { merged, changed };
}

function mergeProjectEntry(existing: any, incoming: any) {
  const updated = { ...existing };
  let changed = false;

  const incomingDescription = typeof incoming.description === "string" ? incoming.description : incoming.description?.join?.(" ") ?? "";
  const existingDescription = typeof existing.description === "string" ? existing.description : existing.description?.join?.(" ") ?? "";

  if (incomingDescription && incomingDescription.length > existingDescription.length) {
    updated.description = incomingDescription;
    changed = true;
  }

  if (incoming.startDate && !existing.startDate) {
    updated.startDate = incoming.startDate;
    changed = true;
  }

  if (incoming.endDate && !existing.endDate) {
    updated.endDate = incoming.endDate;
    changed = true;
  }

  if (incoming.url && !existing.url) {
    updated.url = incoming.url;
    changed = true;
  }

  if (incoming.github && !existing.github) {
    updated.github = incoming.github;
    changed = true;
  }

  const existingTechnologies = Array.isArray(existing.technologies) ? existing.technologies : [];
  const incomingTechnologies = Array.isArray(incoming.technologies) ? incoming.technologies : [];
  const techSet = new Set<string>();
  existingTechnologies.forEach((tech: string) => {
    if (typeof tech === "string" && tech.trim()) {
      techSet.add(tech.trim());
    }
  });
  incomingTechnologies.forEach((tech: string) => {
    if (typeof tech === "string" && tech.trim()) {
      if (!techSet.has(tech.trim())) {
        changed = true;
      }
      techSet.add(tech.trim());
    }
  });
  updated.technologies = Array.from(techSet);

  return { project: updated, changed };
}

function mergeProjects(existingProjects: any[], incomingProjects: any[]) {
  const mergedProjects = [...existingProjects];
  let changed = false;

  incomingProjects.forEach((incomingProject) => {
    const normalizedName = (incomingProject.name || "").toLowerCase().trim();
    const normalizedStart = (incomingProject.startDate || "").toLowerCase().trim();
    let matchIndex = mergedProjects.findIndex((project) => {
      const projectName = (project.name || "").toLowerCase().trim();
      const projectStart = (project.startDate || "").toLowerCase().trim();
      if (!normalizedName || !projectName) return false;
      if (projectName !== normalizedName) return false;
      if (normalizedStart && projectStart) {
        return projectStart === normalizedStart;
      }
      return true;
    });

    if (matchIndex === -1) {
      mergedProjects.push(incomingProject);
      changed = true;
      return;
    }

    const existingProject = mergedProjects[matchIndex];
    const { project, changed: projectChanged } = mergeProjectEntry(existingProject, incomingProject);
    if (projectChanged) {
      mergedProjects[matchIndex] = project;
      changed = true;
    }
  });

  return { merged: mergedProjects, changed };
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

  // Check if profile has meaningful data
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      experience: true,
      education: true,
      skills: true,
      projects: true,
      achievements: true,
      certifications: true,
      volunteer: true,
      leadership: true,
      publications: true,
      awardsHonors: true,
      references: true,
      summary: true,
      objective: true,
    },
  });

  if (!profile) {
    return void res.status(400).json({ 
      message: "Please complete your profile before generating a resume. Add at least one of: experience, education, skills, or projects.",
      error: "profile_incomplete"
    });
  }

  // Check if profile has at least one meaningful data field
  const hasExperience = Array.isArray(profile.experience) && profile.experience.length > 0;
  const hasEducation = Array.isArray(profile.education) && profile.education.length > 0;
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  const hasProjects = Array.isArray(profile.projects) && profile.projects.length > 0;
  const hasAchievements = Array.isArray(profile.achievements) && profile.achievements.length > 0;
  const hasCertifications = Array.isArray(profile.certifications) && profile.certifications.length > 0;
  const hasVolunteer = Array.isArray(profile.volunteer) && profile.volunteer.length > 0;
  const hasLeadership = Array.isArray(profile.leadership) && profile.leadership.length > 0;
  const hasPublications = Array.isArray(profile.publications) && profile.publications.length > 0;
  const hasAwardsHonors = Array.isArray(profile.awardsHonors) && profile.awardsHonors.length > 0;
  const hasReferences = Array.isArray(profile.references) && profile.references.length > 0;
  const hasSummary = profile.summary && typeof profile.summary === 'string' && profile.summary.trim().length > 0;
  const hasObjective = profile.objective && typeof profile.objective === 'string' && profile.objective.trim().length > 0;

  const hasProfileData = hasExperience || hasEducation || hasSkills || hasProjects || 
                         hasAchievements || hasCertifications || hasVolunteer || 
                         hasLeadership || hasPublications || hasAwardsHonors || 
                         hasReferences || hasSummary || hasObjective;

  if (!hasProfileData) {
    return void res.status(400).json({ 
      message: "Please complete your profile before generating a resume. Add at least one of: experience, education, skills, or projects.",
      error: "profile_incomplete"
    });
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
  //console.log('Formatted resume:', formattedResume);

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

    const mapping = mapExtractedProfileToProfile(profileData);

    const appliedSections: string[] = [];
    let profileUpdated = false;

    if (mapping.updatedSections.length) {
      const existingProfile = await prisma.profile.findUnique({ where: { userId } });

      if (existingProfile) {
        const updateData: Record<string, unknown> = {};

        if (mapping.update.skills && mapping.update.skills.length) {
          const { merged, changed } = mergeStringCollections(existingProfile.skills, mapping.update.skills);
          if (changed) {
            updateData.skills = merged;
            appliedSections.push("skills");
          }
        }

        if (mapping.update.leadership && mapping.update.leadership.length) {
          const existingLeadership = asArray<any>(existingProfile.leadership);
          const { merged, changed } = mergeCollections(
            existingLeadership,
            mapping.update.leadership,
            (item) => `${item.org || ""}|${item.position || ""}|${item.startDate || ""}`,
          );
          if (changed) {
            updateData.leadership = merged;
            appliedSections.push("leadership");
          }
        }

        if (mapping.update.references && mapping.update.references.length) {
          const existingReferences = asArray<any>(existingProfile.references);
          const { merged, changed } = mergeCollections(
            existingReferences,
            mapping.update.references,
            (item) => `${item.name || ""}|${item.contact || ""}`,
          );
          if (changed) {
            updateData.references = merged;
            appliedSections.push("references");
          }
        }

        if (mapping.update.experience && mapping.update.experience.length) {
          const existingExperience = asArray<any>(existingProfile.experience);
          const { merged, changed } = mergeCollections(
            existingExperience,
            mapping.update.experience,
            (item) => `${item.title || ""}|${item.company || ""}|${item.startDate || ""}`,
          );
          if (changed) {
            updateData.experience = merged;
            appliedSections.push("experience");
          }
        }

        if (mapping.update.education && mapping.update.education.length) {
          const existingEducation = asArray<any>(existingProfile.education);
          const { merged, changed } = mergeCollections(
            existingEducation,
            mapping.update.education,
            (item) => `${item.school || ""}|${item.degree || ""}|${item.startDate || ""}`,
          );
          if (changed) {
            updateData.education = merged;
            appliedSections.push("education");
          }
        }

        if (mapping.update.projects && mapping.update.projects.length) {
          const existingProjects = asArray<any>(existingProfile.projects);
          const { merged, changed } = mergeProjects(existingProjects, mapping.update.projects);
          if (changed) {
            updateData.projects = merged;
            appliedSections.push("projects");
          }
        }

        if (mapping.update.certifications && mapping.update.certifications.length) {
          const existingCertifications = asArray<any>(existingProfile.certifications);
          const { merged, changed } = mergeCollections(
            existingCertifications,
            mapping.update.certifications,
            (item) => `${item.name || ""}|${item.issuer || ""}|${item.date || ""}`,
          );
          if (changed) {
            updateData.certifications = merged;
            appliedSections.push("certifications");
          }
        }

        if (mapping.update.awardsHonors && mapping.update.awardsHonors.length) {
          const existingAwards = asArray<any>(existingProfile.awardsHonors);
          const { merged, changed } = mergeCollections(
            existingAwards,
            mapping.update.awardsHonors,
            (item) => `${item.title || ""}|${item.issuer || ""}|${item.date || ""}`,
          );
          if (changed) {
            updateData.awardsHonors = merged;
            appliedSections.push("awardsHonors");
          }
        }

        if (mapping.update.volunteer && mapping.update.volunteer.length) {
          const existingVolunteer = asArray<any>(existingProfile.volunteer);
          const { merged, changed } = mergeCollections(
            existingVolunteer,
            mapping.update.volunteer,
            (item) => `${item.org || ""}|${item.role || ""}|${item.startDate || ""}`,
          );
          if (changed) {
            updateData.volunteer = merged;
            appliedSections.push("volunteer");
          }
        }

        if (mapping.update.publications && mapping.update.publications.length) {
          const existingPublications = asArray<any>(existingProfile.publications);
          const { merged, changed } = mergeCollections(
            existingPublications,
            mapping.update.publications,
            (item) => `${item.title || ""}|${item.venue || ""}|${item.date || ""}`,
          );
          if (changed) {
            updateData.publications = merged;
            appliedSections.push("publications");
          }
        }

        if (mapping.update.summary) {
          const existingSummary = typeof existingProfile.summary === "string" ? existingProfile.summary.trim() : "";
          if (!existingSummary || existingSummary !== mapping.update.summary) {
            updateData.summary = mapping.update.summary;
            appliedSections.push("summary");
          }
        }

        if (mapping.update.links && mapping.update.links.length) {
          const existingLinks = asArray<any>(existingProfile.links);
          const existingKeys = new Set(
            existingLinks.map((link) => `${(link.name || "").toLowerCase()}|${(link.url || "").toLowerCase()}`)
          );
          
          const newLinks = mapping.update.links.filter((link) => {
            const key = `${(link.name || "").toLowerCase()}|${(link.url || "").toLowerCase()}`;
            return !existingKeys.has(key);
          });

          if (newLinks.length > 0) {
            const mergedLinks = [...existingLinks, ...newLinks];
            updateData.links = mergedLinks;
            appliedSections.push("links");
          }
        }

        if (Object.keys(updateData).length) {
          await prisma.profile.update({
            where: { userId },
            data: updateData as any,
          });
          await rdel(profileCacheKey(userId));
          profileUpdated = true;
        }
      } else if (Object.keys(mapping.update).length) {
        await prisma.profile.create({
          data: {
            userId,
            skills: mapping.update.skills ?? [],
            experience: mapping.update.experience ?? [],
            education: mapping.update.education ?? [],
            projects: mapping.update.projects ?? [],
            achievements: [], // default empty
            certifications: mapping.update.certifications ?? [],
            volunteer: mapping.update.volunteer ?? [],
            leadership: mapping.update.leadership ?? [],
            publications: mapping.update.publications ?? [],
            awardsHonors: mapping.update.awardsHonors ?? [],
            references: mapping.update.references ?? [],
            links: mapping.update.links ?? [],
            summary: mapping.update.summary ?? null,
            objective: mapping.update.objective ?? null,
            createdAt: new Date(),
          },
        });
        await rdel(profileCacheKey(userId));
        profileUpdated = true;
        appliedSections.push(...mapping.updatedSections);
      }
    }

    // Save personal information if extracted
    let personalInfoUpdated = false;
    if (mapping.personalInfo) {
      // Ensure profile exists first
      let profile = await prisma.profile.findUnique({ 
        where: { userId },
        select: { id: true },
      });

      if (!profile) {
        // Create profile if it doesn't exist
        profile = await prisma.profile.create({
          data: {
            userId,
            skills: [],
            experience: [],
            education: [],
            projects: [],
            achievements: [],
            certifications: [],
            volunteer: [],
            leadership: [],
            publications: [],
            awardsHonors: [],
            references: [],
            summary: null,
            objective: null,
            createdAt: new Date(),
          },
          select: { id: true },
        });
        await rdel(profileCacheKey(userId));
      }

      if (profile) {
        // Check if personal info already exists
        const existingPersonalInfo = await prisma.personalInformation.findUnique({
          where: { profileId: profile.id },
        });

        // Only update fields that are provided and different from existing
        const updateData: Record<string, any> = {};
        if (mapping.personalInfo.fullName !== undefined) {
          const cleanFullName = mapping.personalInfo.fullName?.trim() || null;
          if (!existingPersonalInfo?.fullName || cleanFullName !== existingPersonalInfo.fullName) {
            updateData.fullName = cleanFullName;
          }
        }
        if (mapping.personalInfo.email !== undefined) {
          const cleanEmail = mapping.personalInfo.email?.trim() || null;
          if (!existingPersonalInfo?.email || cleanEmail !== existingPersonalInfo.email) {
            updateData.email = cleanEmail;
          }
        }
        // Save phone number if extracted
        if (mapping.personalInfo.phone !== undefined) {
          const cleanPhone = mapping.personalInfo.phone?.trim() || null;
          // Update if no existing phone or if the extracted phone is different
          if (!existingPersonalInfo?.phone || cleanPhone !== existingPersonalInfo.phone) {
            updateData.phone = cleanPhone;
          }
        }
        if (mapping.personalInfo.location !== undefined) {
          const cleanLocation = mapping.personalInfo.location?.trim() || null;
          if (!existingPersonalInfo?.location || cleanLocation !== existingPersonalInfo.location) {
            updateData.location = cleanLocation;
          }
        }
        if (mapping.personalInfo.linkedIn !== undefined) {
          const cleanLinkedIn = mapping.personalInfo.linkedIn?.trim() || null;
          if (!existingPersonalInfo?.linkedIn || cleanLinkedIn !== existingPersonalInfo.linkedIn) {
            updateData.linkedIn = cleanLinkedIn;
          }
        }
        if (mapping.personalInfo.portfolio !== undefined) {
          const cleanPortfolio = mapping.personalInfo.portfolio?.trim() || null;
          if (!existingPersonalInfo?.portfolio || cleanPortfolio !== existingPersonalInfo.portfolio) {
            updateData.portfolio = cleanPortfolio;
          }
        }
        if (mapping.personalInfo.jobTitle !== undefined) {
          const cleanJobTitle = mapping.personalInfo.jobTitle?.trim() || null;
          if (!existingPersonalInfo?.jobTitle || cleanJobTitle !== existingPersonalInfo.jobTitle) {
            updateData.jobTitle = cleanJobTitle;
          }
        }
        if (mapping.personalInfo.pronouns !== undefined) {
          const cleanPronouns = mapping.personalInfo.pronouns?.trim() || null;
          if (!existingPersonalInfo?.pronouns || cleanPronouns !== existingPersonalInfo.pronouns) {
            updateData.pronouns = cleanPronouns;
          }
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.personalInformation.upsert({
            where: { profileId: profile.id },
            update: updateData,
            create: {
              profileId: profile.id,
              fullName: mapping.personalInfo.fullName?.trim() || null,
              email: mapping.personalInfo.email?.trim() || null,
              phone: mapping.personalInfo.phone?.trim() || null,
              location: mapping.personalInfo.location?.trim() || null,
              linkedIn: mapping.personalInfo.linkedIn?.trim() || null,
              portfolio: mapping.personalInfo.portfolio?.trim() || null,
              jobTitle: mapping.personalInfo.jobTitle?.trim() || null,
              pronouns: mapping.personalInfo.pronouns?.trim() || null,
            },
          });
          personalInfoUpdated = true;
          appliedSections.push("personalInfo");
        }
      }
    }

    res.status(200).json({
      message: "Resume processed successfully",
      data: profileData,
      mapped: {
        appliedSections: Array.from(new Set(appliedSections)),
        warnings: mapping.warnings,
        profileUpdated,
        personalInfoUpdated,
      },
    });
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