import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../lib/prisma";
import { catchAsync } from "../../../utils/catchAsync";


export const getExperiences = catchAsync( async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const experiences = await prisma.experience.findMany({
            where: {
                userId
            }
        })

        res.status(200).json({
            message: "Experiences fetched successfully",
            experiences
        })
    }
)

export const addExperiences = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const { experiences } = req.body;
  
      if (!Array.isArray(experiences)) {
        res.status(400).json({ message: "Experiences must be an array" });
        return;
      }
  
      const experiencePromises = experiences.map((experience) =>
        prisma.experience.create({
          data: {
            userId,
            title: experience.title,
            company: experience.company,
            description: experience.description,
            startDate: new Date(experience.startDate),
            endDate: experience.endDate ? new Date(experience.endDate) : null,
            responsibilities: experience.responsibilities ?? [], // Optional: fallback to []
          },
        })
      );
  
      await Promise.all(experiencePromises);
  
      res.status(200).json({
        message: "Experiences added successfully",
      });
    }
  );
  

  export const updateExperiences = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const { experiences } = req.body;
  
      if (!Array.isArray(experiences)) {
        res.status(400).json({ message: "Experiences must be an array" });
        return;
      }
  
      const experiencePromises = experiences.map((experience) =>
        prisma.experience.updateMany({
          where: {
            id,
            userId,
          },
          data: {
            title: experience.title,
            company: experience.company,
            description: experience.description,
            startDate: new Date(experience.startDate),
            endDate: experience.endDate ? new Date(experience.endDate) : null,
            responsibilities: experience.responsibilities,
          },
        })
      );
  
      await Promise.all(experiencePromises);
  
      res.status(200).json({
        message: "Experiences updated successfully",
      });
    }
  );
  


  
  export const deleteExperience = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const { id } = req.params;
  
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const result = await prisma.experience.deleteMany({
        where: {
          id,
          userId,
        },
      });
  
      if (result.count === 0) {
        res.status(404).json({ message: "Experience not found or unauthorized" });
        return;
      }
  
      res.status(200).json({ message: "Experience deleted successfully" });
    }
  );
  