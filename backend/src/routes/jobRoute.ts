import express from 'express';
import {
  createJobDescription,
  getJobDescriptions,
  getJobDescription,
  deleteJobDescription,
} from '../controllers/jobDescriptionController';
import { protect } from '../controllers/authController';

const router = express.Router();

router.post('/', protect, createJobDescription);
router.get('/', protect, getJobDescriptions);
router.get('/:id', protect, getJobDescription);
router.delete('/:id', protect, deleteJobDescription);

export default router;