import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import { formatDate } from '../../utils/formateDate';
import { rget, rset, rdel } from '../../utils/rcache';
import { z } from 'zod';


const TTL_SEC = 60 * 60 * 24; // 24 hours
const KProfile  = (userId: string) => `rr:v1:profile:${userId}`;
const KPersonal = (userId: string) => `personalInfo:${userId}`;

const PersonalInfoInput = z.object({
    fullName:  z.string().max(200).optional(),
    phone:     z.string().max(50).optional(),
    location:  z.string().max(200).optional(),
    linkedIn:  z.string().url().optional().or(z.literal("")).optional(),
    portfolio: z.string().url().optional().or(z.literal("")).optional(),
    jobTitle:  z.string().max(120).optional(),
    pronouns:  z.string().max(60).optional(),
    email:     z.string().email().optional(),
  }).strict();
  
  // Treat empty strings as nulls; leave undefined as "don't change"
  const toNull = (s?: string) => {
    if (s === undefined) return undefined;
    const v = s.trim();
    return v.length ? v : null;
  };


export const getPersonalInfo = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
  
    const key = KPersonal(userId);
  
    // 1) Try cache first
    const cached = await rget<any>(key);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.status(200).json({
        message: "Personal info fetched successfully",
        data: cached,
      });
      return;
    }
  
    // 2) Load from DB
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
  
    // personalInfo depends on profile.id; user can be fetched in parallel
    const [personalInfo, user] = await Promise.all([
      prisma.personalInformation.findUnique({ where: { profileId: profile.id } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    ]);
  
    // 3) Compose the response shape (mirror your original behavior)
    const responseData = personalInfo
      ? {
          ...personalInfo,
          fullName: personalInfo.fullName || user?.name || null,
          email: (personalInfo as any).email || user?.email || null,
        }
      : {
          fullName: user?.name || null,
          phone: null,
          location: null,
          linkedIn: null,
          portfolio: null,
          jobTitle: null,
          pronouns: null,
          email: user?.email || null,
        };
  
    // 4) Cache the composed payload for future requests
    await rset(key, responseData, { ttlSec: TTL_SEC });
  
    res.setHeader("X-Cache", "MISS");
    res.status(200).json({
      message: "Personal info fetched successfully",
      data: responseData,
    });
    return;
  });

export const upsertPersonalInfo = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
  
    // Validate input
    const parsed = PersonalInfoInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      return;
    }
    const input = parsed.data;
  
    // Ensure profile exists (link via profileId)
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
  
    // Get user for fallback fullName/email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
  
    // Normalize fields: trim and convert "" -> null
    const normalized = {
      fullName:  input.fullName  !== undefined ? toNull(input.fullName)   : undefined,
      phone:     input.phone     !== undefined ? toNull(input.phone)      : undefined,
      location:  input.location  !== undefined ? toNull(input.location)   : undefined,
      linkedIn:  input.linkedIn  !== undefined ? toNull(input.linkedIn)   : undefined,
      portfolio: input.portfolio !== undefined ? toNull(input.portfolio)  : undefined,
      jobTitle:  input.jobTitle  !== undefined ? toNull(input.jobTitle)   : undefined,
      pronouns:  input.pronouns  !== undefined ? toNull(input.pronouns)   : undefined,
      email:     input.email     !== undefined ? toNull(input.email)      : undefined,
    } as const;
  
    // Build partial update object (only defined keys)
    const updateData: Record<string, any> = {};
    for (const [k, v] of Object.entries(normalized)) {
      if (v !== undefined) updateData[k] = v;
    }
  
    // Upsert personalInformation
    const personalInfo = await prisma.personalInformation.upsert({
      where: { profileId: profile.id },
      update: updateData,
      create: { profileId: profile.id, ...updateData },
      select: {
        profileId: true,
        fullName: true,
        phone: true,
        location: true,
        linkedIn: true,
        portfolio: true,
        jobTitle: true,
        pronouns: true,
        email: true,
        // id: true, updatedAt: true, // add if you need them
      },
    });
  
    // Compose response (match GET behavior with fallbacks)
    const responseData = {
      ...personalInfo,
      fullName: personalInfo.fullName ?? user?.name ?? null,
      email:    (personalInfo as any).email ?? user?.email ?? null,
    };
  
    // Write-through to Redis for fast reads
    await rset(KPersonal(userId), responseData, { ttlSec: TTL_SEC });
  
    // Invalidate any aggregate caches that depend on personal info (optional)
    await rdel(KProfile(userId)); // safe no-op if not cached
  
    res.status(200).json({
      message: "Personal information updated successfully",
      data: responseData,
    });
    return;
  });

