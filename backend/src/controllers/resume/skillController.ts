import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../lib/prisma";
import { catchAsync } from "../../../utils/catchAsync";

export const getSkills = catchAsync( async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const skills = await prisma.skill.findMany({
            where: {
                userId
            }
        })
        res.status(200).json({ message: "Skills fetched successfully", skills })
})

export const addSkills = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const skills  = req.body;
  
      if (
        !skills ||
        typeof skills !== "object" ||
        Array.isArray(skills) ||
        Object.values(skills).some((val) => !Array.isArray(val))
      ) {
        res.status(400).json({
          message:
            "Skills must be an object with arrays as values, e.g. { technical: ['html'], soft: [...] }",
        });
        return;
      }
  
      const existing = await prisma.skill.findUnique({
        where: { userId },
      });
  
      const mergedSkills: Record<string, string[]> = {};
      const existingMetadata = existing?.metadata as Record<string, string[]>;
  
      const categories = new Set([
        ...Object.keys(existingMetadata || {}),
        ...Object.keys(skills),
      ]);
  
      for (const category of categories) {
        const existingList = existingMetadata?.[category] || [];
        const newList = skills[category] || [];
        mergedSkills[category] = Array.from(new Set([...existingList, ...newList]));
      }
  
      await prisma.skill.upsert({
        where: { userId },
        update: { metadata: mergedSkills },
        create: { userId, metadata: mergedSkills },
      });
  
      res.status(200).json({ message: "Skills updated successfully." });
    }
  );
  

  export const updateSkills = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const { skills } = req.body;
  
      if (
        !skills ||
        typeof skills !== "object" ||
        Array.isArray(skills) ||
        Object.values(skills).some((val) => !Array.isArray(val))
      ) {
        res.status(400).json({
          message:
            "Skills must be an object with arrays as values, e.g. { technical: ['html'], soft: [...] }",
        });
        return;
      }
  
      await prisma.skill.upsert({
        where: { userId },
        update: { metadata: skills },
        create: { userId, metadata: skills },
      });
  
      res.status(200).json({ message: "Skills replaced successfully." });
    }
  );
  
  export const deleteSkill = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const { category, name } = req.params;
  
      if (!category || !name) {
        res.status(400).json({ message: "Missing category or skill name" });
        return;
      }
  
      const existing = await prisma.skill.findUnique({
        where: { userId },
      });
  
      if (!existing || !existing.metadata) {
        res.status(404).json({ message: "No skills found for user" });
        return;
      }
  
      const existingMetadata = existing.metadata as Record<string, string[]>;
  
      if (!existingMetadata[category]) {
        res.status(404).json({ message: `Category '${category}' not found` });
        return;
      }
  
      const updatedCategory = existingMetadata[category].filter(
        (skill) => skill.toLowerCase() !== name.toLowerCase()
      );
  
      // If nothing changed, skill not found
      if (updatedCategory.length === existingMetadata[category].length) {
        res.status(404).json({ message: `Skill '${name}' not found in '${category}'` });
        return;
      }
  
      const updatedMetadata = {
        ...existingMetadata,
        [category]: updatedCategory,
      };
  
      await prisma.skill.update({
        where: { userId },
        data: { metadata: updatedMetadata },
      });
  
      res.status(200).json({
        message: `Skill '${name}' removed from category '${category}'`,
      });
    }
  );
  