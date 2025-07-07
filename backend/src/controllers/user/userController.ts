import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { prisma } from "../../../lib/prisma";

export const getUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user?.id;
    }
)