import { NextFunction, Request, Response } from "express";
import { jobDescriptionSchema } from "../../../schemas/resume.schema";
import { JobService } from "../../services/job.service";
import { catchAsync } from "../../../utils/catchAsync";
import { JobDescriptionInput } from "../../types";

export const createJobDescription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = jobDescriptionSchema.safeParse(req.body);
  
    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid job description",
        errors: parsed.error.flatten(),
      });
    }
  
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  
    const job = await JobService.saveJobDescription(userId, parsed.data as JobDescriptionInput);
  
    res.status(201).json({
      message: "Job description saved successfully",
      jobId: job.id,
    });
  });


  export const parseJobDescription = catchAsync(async (req: Request, res: Response) => {
    const jobId = req.params.id;
    const parsed = await JobService.parseJobDescription(jobId);
  
    res.status(200).json({
      message: "Job description parsed successfully",
      parsedData: parsed,
    });
  });