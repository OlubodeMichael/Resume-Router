import express from 'express';
import {
  createResume,
  getResumes,
  getResume,
  deleteResume,
} from '../controllers/resumeController';
import { protect } from '../controllers/authController';

const router = express.Router();

router.post('/', protect, createResume);
router.get('/', protect, getResumes);
router.get('/:id', protect, getResume);
router.delete('/:id', protect, deleteResume);

export default router;