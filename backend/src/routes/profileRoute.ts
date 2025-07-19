import express from 'express';
import {
  getProfile,
  upsertProfile,
  addEducationEntry,
  updateEducationEntry,
  deleteEducationEntry,
  addExperienceEntry,
  updateExperienceEntry,
  deleteExperienceEntry,
  addSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/profileController';
import { protect } from '../controllers/authController';

const router = express.Router();

router.get('/', protect, getProfile);
router.post('/', protect, upsertProfile);

router.post('/education', protect, addEducationEntry);
router.patch('/education/:index', protect, updateEducationEntry);
router.delete('/education/:index', protect, deleteEducationEntry);

router.post('/experience', protect, addExperienceEntry);
router.patch('/experience/:index', protect, updateExperienceEntry);
router.delete('/experience/:index', protect, deleteExperienceEntry);

router.post('/skills', protect, addSkill);
router.patch('/skills/:index', protect, updateSkill);
router.delete('/skills/:index', protect, deleteSkill);

export default router;