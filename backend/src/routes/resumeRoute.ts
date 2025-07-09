import express, { RequestHandler } from "express";
import { updatePersonalInfo } from "../controllers/resume/personalInfoController";
import {
  addExperiences,
  deleteExperience,
  getExperiences,
  updateExperiences,
} from "../controllers/resume/experienceController";

import {
  addEducation,
  deleteEducation,
  getEducation,
  updateEducation,
} from "../controllers/resume/educationController";
import {
  addSkills,
  updateSkills,
  deleteSkill,
  getSkills,
} from "../controllers/resume/skillController";
import { protect } from "../controllers/user/authController";

const router = express.Router();

router.post("/personal-info", protect as RequestHandler, updatePersonalInfo as RequestHandler);

router.get("/experiences", protect as RequestHandler, getExperiences as RequestHandler);
router.post("/experiences", protect as RequestHandler, addExperiences as RequestHandler);
router.patch("/experiences/:id", protect as RequestHandler, updateExperiences as RequestHandler);
router.delete("/experiences/:id", protect as RequestHandler, deleteExperience as RequestHandler);

router.get("/education", protect as RequestHandler, getEducation as RequestHandler);
router.post("/education", protect as RequestHandler, addEducation as RequestHandler);
router.patch("/education/:id", protect as RequestHandler, updateEducation as RequestHandler);
router.delete("/education/:id", protect as RequestHandler, deleteEducation as RequestHandler);

router.get("/skills", protect as RequestHandler, getSkills as RequestHandler);
router.post("/skills", protect as RequestHandler, addSkills as RequestHandler);
router.patch("/skills/:id", protect as RequestHandler, updateSkills as RequestHandler);
router.delete("/skills/:category/:name", protect as RequestHandler, deleteSkill as RequestHandler);

export default router;
