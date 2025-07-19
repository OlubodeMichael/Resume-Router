import express from 'express';
import { getUser, updateUser, deleteUser } from '../controllers/userController';
import { protect } from '../controllers/authController';

const router = express.Router();

router.get('/me', protect, getUser);
router.patch('/me', protect, updateUser);
router.delete('/me', protect, deleteUser);

export default router;