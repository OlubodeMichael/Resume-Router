import express, { RequestHandler } from 'express';
import { protect } from '../controllers/user/authController';
import { getMe } from '../controllers/user/userController';

const router = express.Router();

router.get("/me", protect as RequestHandler, getMe as RequestHandler);

export default router;