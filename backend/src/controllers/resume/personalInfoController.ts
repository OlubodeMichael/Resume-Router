import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../lib/prisma";
import { catchAsync } from "../../../utils/catchAsync";
import { personalInfoSchema } from "../../../schemas/resume.schema";

export const updatePersonalInfo = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const parsed = personalInfoSchema.safeParse(req.body);
  
      if(!parsed.success) {
          res.status(400).json({ 
              message: "Invalid personal information",
              errors: parsed.error.flatten().fieldErrors,
          });
          return;
      }
  
      const { name, phone, linkedin, address } = parsed.data;
  
      await prisma.user.update({
          where: { id: userId },
          data: {
              name: name || undefined,
              phone: phone || undefined,
              linkedin: linkedin || undefined,
              address: address || undefined,
          }
      })
  
      res.status(200).json({
          message: "Personal information updated successfully",
      })
    }
);
