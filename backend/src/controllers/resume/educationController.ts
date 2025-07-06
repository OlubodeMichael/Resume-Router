import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../lib/prisma";
import { catchAsync } from "../../../utils/catchAsync";


export const getEducation = catchAsync( async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }

    const education = await prisma.education.findMany({
        where: {
            userId
        }
    })

    res.status(200).json({ 
        message: "Education fetched successfully",
        education,
        result: education.length 
    })
})


export const addEducation = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const { education } = req.body;
  
      if (!Array.isArray(education)) {
        res.status(400).json({ message: "Education must be an array" });
        return;
      }
  
      const educationPromises = education.map((edu) =>
        prisma.education.create({
          data: {
            userId,
            school: edu.school,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
          },
        })
      );
  
      await Promise.all(educationPromises);
  
      res.status(200).json({ message: "Education added successfully" });
    }
  );
  

  export const updateEducation = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const { id } = req.params;
  
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      // ✅ Accept fields directly
      const { school, degree, fieldOfStudy, startDate, endDate } = req.body;
  
      const result = await prisma.education.updateMany({
        where: {
          id,
          userId,
        },
        data: {
          school,
          degree,
          fieldOfStudy,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
        },
      });
  
      if (result.count === 0) {
        res.status(404).json({ message: "Education not found or unauthorized" });
        return;
      }
  
      res.status(200).json({ message: "Education updated successfully" });
    }
  );
  
  

  
  export const deleteEducation = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
      const { id } = req.params;
  
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const result = await prisma.education.deleteMany({
        where: {
          id,
          userId,
        },
      });
  
      if (result.count === 0) {
        res.status(404).json({ message: "Education not found or not authorized" });
        return;
      }
  
      res.status(200).json({
        message: "Education deleted successfully",
      });
    }
  );
  