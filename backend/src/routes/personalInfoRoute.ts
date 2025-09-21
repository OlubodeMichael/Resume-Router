import express from 'express';
import { getPersonalInfo, upsertPersonalInfo } from '../controllers/personalInfoController';
import { protect } from '../controllers/authController';

const router = express.Router();

router.get('/', protect, getPersonalInfo);
router.post('/', protect, upsertPersonalInfo);

export default router;