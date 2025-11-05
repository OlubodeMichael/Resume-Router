import express from 'express';
import multer from 'multer';
import path from 'path';
import * as Resume from '../controllers/resumeController';
import { protect } from '../controllers/authController';
import { requireEntitlement } from '../middleware/requireEntitlement';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be stored in uploads directory
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF and DOCX files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

router.post('/', protect, requireEntitlement({ 
  feature: 'resume', 
  creditCost: 10, 
  opKeyFromReq: (req) => req.body.resumeId || `resume:${req.user.id}:${Date.now()}` }), Resume.createResume);
router.get('/', protect, Resume.getResumes);
router.get('/:id', protect, Resume.getResume);
router.post('/:id', protect, Resume.updateResume); // POST for updating resume content
router.delete('/:id', protect, Resume.deleteResume);
router.post('/parse', protect, upload.single('resume'), Resume.parseResume);
router.post('/:id/tailor', protect, Resume.tailorResume);
router.get('/:id/status', protect, Resume.getResumeStatus);
router.get('/:id/stream', protect, Resume.resumeStream);
/*
router.post('/:resumeId/template', protect, setTemplateId);
router.get('/:resumeId/template', protect, getTemplateId);
*/

export default router;