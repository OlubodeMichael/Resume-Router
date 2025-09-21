// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../utils/appError";

// Extend Express Request interface with Prisma User type
declare global {
  namespace Express {
    interface Request {
      user?: User; // Use Prisma User type
    }
  }
}

// Get User
export const getUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({
    message: "User fetched successfully",
    user,
  });
});

// Update User
export const updateUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { name, email } = req.body;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const existingUser = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (existingUser) {
    res.status(400).json({ message: "Email already in use" });
    return;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email, updatedAt: new Date() },
    select: { id: true, email: true, name: true },
  });

  res.status(200).json({
    message: "User updated successfully",
    user,
  });
});

// Delete User
export const deleteUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  const hasRelations = await prisma.resume.count({ where: { userId } }) > 0 || await prisma.jobDescription.count({ where: { userId } }) > 0;
  if (hasRelations) {
    res.status(400).json({ message: "Cannot delete user with associated resumes or job descriptions" });
    return;
  }

  await prisma.user.delete({ where: { id: userId } });

  res.status(200).json({ message: "User deleted successfully" });
});

