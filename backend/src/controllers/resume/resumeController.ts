import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { ResumeService } from "../../services/resume.service";

export const generateResume = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { jobDescriptionId } = req.body;

  if (!userId || !jobDescriptionId) {
    res.status(400).json({ message: "Missing userId or jobDescriptionId" });
    return;
  }

  const resume = await ResumeService.generateResume(userId, jobDescriptionId);

  res.status(201).json({
    message: "Resume generated successfully",
    resume,
  });
});
