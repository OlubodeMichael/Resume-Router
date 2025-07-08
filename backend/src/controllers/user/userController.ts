import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import AppError from "../../../utils/appError";
import { prisma } from "../../../lib/prisma";

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user?.id;

        if(!userId) {
            return next(new AppError("User not authenticated", 401));
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                linkedin: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        
        if(!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ message: "User fetched successfully", user });
})
