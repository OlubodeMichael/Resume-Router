import express from 'express';
import {
  createJobDescription,
  getJobDescriptions,
  getJobDescription,
  deleteJobDescription,
} from '../controllers/jobDescriptionController';
import { protect } from '../controllers/authController';
import { requireEntitlement } from '../middleware/requireEntitlement';

const router = express.Router();

router.post('/', 
  protect, 
  requireEntitlement({
    feature: "resume",
    creditCost: 10,
    opKeyFromReq: (req) => `job-${req.user?.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }),
  createJobDescription
);
router.get('/', protect, getJobDescriptions);
router.get('/:id', protect, getJobDescription);
router.delete('/:id', protect, deleteJobDescription);

export default router;