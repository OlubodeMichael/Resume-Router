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
  addBulkSkills,
  updateSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  updateCertification,
  deleteCertification,
  getCertifications,
  addAwardHonor,
  updateAwardHonor,
  deleteAwardHonor,
  getAwardsHonors,
  addVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getVolunteers,
  addLeadershipActivity,
  updateLeadershipActivity,
  deleteLeadershipActivity,
  getLeadership,
  addPublication,
  updatePublication,
  deletePublication,
  getPublications,
  addReference,
  updateReference,
  deleteReference,
  getReferences,
  updateSummary,
  getSummary,
  updateObjective,
  getObjective,
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
router.post('/skills/bulk', protect, addBulkSkills);
router.patch('/skills/:index', protect, updateSkill);
router.delete('/skills/:index', protect, deleteSkill);

router.post('/projects', protect, addProject);
router.patch('/projects/:index', protect, updateProject);
router.delete('/projects/:index', protect, deleteProject);

// Certifications
router.get('/certifications', protect, getCertifications);
router.post('/certifications', protect, addCertification);
router.patch('/certifications/:index', protect, updateCertification);
router.delete('/certifications/:index', protect, deleteCertification);

// Awards & Honors
router.get('/awards-honors', protect, getAwardsHonors);
router.post('/awards-honors', protect, addAwardHonor);
router.patch('/awards-honors/:index', protect, updateAwardHonor);
router.delete('/awards-honors/:index', protect, deleteAwardHonor);

// Volunteer Experience
router.get('/volunteer', protect, getVolunteers);
router.post('/volunteer', protect, addVolunteer);
router.patch('/volunteer/:index', protect, updateVolunteer);
router.delete('/volunteer/:index', protect, deleteVolunteer);

// Leadership
router.get('/leadership', protect, getLeadership);
router.post('/leadership', protect, addLeadershipActivity);
router.patch('/leadership/:index', protect, updateLeadershipActivity);
router.delete('/leadership/:index', protect, deleteLeadershipActivity);

// Publications
router.get('/publications', protect, getPublications);
router.post('/publications', protect, addPublication);
router.patch('/publications/:index', protect, updatePublication);
router.delete('/publications/:index', protect, deletePublication);

// References
router.get('/references', protect, getReferences);
router.post('/references', protect, addReference);
router.patch('/references/:index', protect, updateReference);
router.delete('/references/:index', protect, deleteReference);

// Summary
router.get('/summary', protect, getSummary);
router.patch('/summary', protect, updateSummary);

// Objective
router.get('/objective', protect, getObjective);
router.patch('/objective', protect, updateObjective);

export default router;