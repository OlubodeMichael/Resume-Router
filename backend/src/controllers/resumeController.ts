import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";

export const createResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, address, summary, experience, education, skills } = req.body;

        const resume = await prisma.resume.create({
            data: {
                name,
                email,
                phone,
                address,
                summary,
                experience,
                education,
                skills,
            }
        })

        res.status(201).json({
            message: "Resume created successfully",
            resume
        })
    } catch (error) {
        console.error("Error creating resume:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}