import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';

interface Education {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string | null;
}

interface Experience {
  title: string;
  company: string;
  responsibilities: string[];
  startDate: string;
  endDate?: string | null;
}

// Get Profile
export const getProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  res.status(200).json({
    message: 'Profile fetched successfully',
    profile,
  });
});

// Upsert Profile
export const upsertProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const { skills, experience, education, projects, achievements } = req.body;

  if (skills && !Array.isArray(skills)) {
    res.status(400).json({ message: 'Skills must be an array' });
    return;
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      skills: skills || [],
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      achievements: achievements || [],
    },
    create: {
      userId,
      skills: skills || [],
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      achievements: achievements || [],
      createdAt: new Date(),
    },
  });

  res.status(200).json({
    message: 'Profile saved successfully',
    profile,
  });
});

// Add Education Entry
export const addEducationEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { school, degree, fieldOfStudy, startDate, endDate } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!school || !degree || !startDate) {
    res.status(400).json({ message: 'School, degree, and startDate are required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentEducation = Array.isArray(profile?.education) ? (profile.education as unknown as Education[]) : [];

  const newEducation: Education[] = [
    ...currentEducation,
    {
      school,
      degree,
      fieldOfStudy,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { education: newEducation as any },
    create: {
      userId,
      skills: [],
      experience: [],
      education: newEducation as any,
      projects: [],
      achievements: [],
      createdAt: new Date(),
    },
  });

  res.status(200).json({
    message: 'Education entry added successfully',
    profile: updatedProfile,
  });
});

// Update Education Entry
export const updateEducationEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { school, degree, fieldOfStudy, startDate, endDate } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!school || !degree || !startDate) {
    res.status(400).json({ message: 'School, degree, and startDate are required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentEducation = Array.isArray(profile.education) ? (profile.education as unknown as Education[]) : [];
  const educationIndex = parseInt(index, 10);

  if (isNaN(educationIndex) || educationIndex < 0 || educationIndex >= currentEducation.length) {
    res.status(400).json({ message: 'Invalid education index' });
    return;
  }

  currentEducation[educationIndex] = {
    school,
    degree,
    fieldOfStudy,
    startDate: new Date(startDate).toISOString(),
    endDate: endDate ? new Date(endDate).toISOString() : null,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { education: currentEducation as any },
  });

  res.status(200).json({
    message: 'Education entry updated successfully',
    profile: updatedProfile,
  });
});

// Delete Education Entry
export const deleteEducationEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentEducation = Array.isArray(profile.education) ? (profile.education as unknown as Education[]) : [];
  const educationIndex = parseInt(index, 10);

  if (isNaN(educationIndex) || educationIndex < 0 || educationIndex >= currentEducation.length) {
    res.status(400).json({ message: 'Invalid education index' });
    return;
  }

  const updatedEducation = currentEducation.filter((_, i) => i !== educationIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { education: updatedEducation as any },
  });

  res.status(200).json({
    message: 'Education entry deleted successfully',
    profile: updatedProfile,
  });
});

// Add Experience Entry
export const addExperienceEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { title, company, responsibilities, startDate, endDate } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!title || !company || !responsibilities || !startDate) {
    res.status(400).json({ message: 'Title, company, responsibilities, and startDate are required' });
    return;
  }

  if (!Array.isArray(responsibilities)) {
    res.status(400).json({ message: 'Responsibilities must be an array' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentExperience = Array.isArray(profile?.experience) ? (profile.experience as unknown as Experience[]) : [];

  const newExperience: Experience[] = [
    ...currentExperience,
    {
      title,
      company,
      responsibilities,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { experience: newExperience as any },
    create: {
      userId,
      skills: [],
      experience: newExperience as any,
      education: [],
      projects: [],
      achievements: [],
      createdAt: new Date(),
    },
  });

  res.status(200).json({
    message: 'Experience entry added successfully',
    profile: updatedProfile,
  });
});

// Update Experience Entry
export const updateExperienceEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { title, company, responsibilities, startDate, endDate } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!title || !company || !responsibilities || !startDate) {
    res.status(400).json({ message: 'Title, company, responsibilities, and startDate are required' });
    return;
  }

  if (!Array.isArray(responsibilities)) {
    res.status(400).json({ message: 'Responsibilities must be an array' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentExperience = Array.isArray(profile.experience) ? (profile.experience as unknown as Experience[]) : [];
  const experienceIndex = parseInt(index, 10);

  if (isNaN(experienceIndex) || experienceIndex < 0 || experienceIndex >= currentExperience.length) {
    res.status(400).json({ message: 'Invalid experience index' });
    return;
  }

  currentExperience[experienceIndex] = {
    title,
    company,
    responsibilities,
    startDate: new Date(startDate).toISOString(),
    endDate: endDate ? new Date(endDate).toISOString() : null,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { experience: currentExperience as any },
  });

  res.status(200).json({
    message: 'Experience entry updated successfully',
    profile: updatedProfile,
  });
});

// Delete Experience Entry
export const deleteExperienceEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentExperience = Array.isArray(profile.experience) ? (profile.experience as unknown as Experience[]) : [];
  const experienceIndex = parseInt(index, 10);

  if (isNaN(experienceIndex) || experienceIndex < 0 || experienceIndex >= currentExperience.length) {
    res.status(400).json({ message: 'Invalid experience index' });
    return;
  }

  const updatedExperience = currentExperience.filter((_, i) => i !== experienceIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { experience: updatedExperience as any },
  });

  res.status(200).json({
    message: 'Experience entry deleted successfully',
    profile: updatedProfile,
  });
});

// Add Skill
export const addSkill = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { skill } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!skill || typeof skill !== 'string') {
    res.status(400).json({ message: 'Skill is required and must be a string' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentSkills = profile?.skills || [];

  if (currentSkills.includes(skill)) {
    res.status(400).json({ message: 'Skill already exists' });
    return;
  }

  const newSkills = [...currentSkills, skill];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { skills: newSkills },
    create: {
      userId,
      skills: newSkills,
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      createdAt: new Date(),
    },
  });

  res.status(200).json({
    message: 'Skill added successfully',
    profile: updatedProfile,
  });
});

// Update Skill
export const updateSkill = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { skill } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!skill || typeof skill !== 'string') {
    res.status(400).json({ message: 'Skill is required and must be a string' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentSkills = profile.skills || [];
  const skillIndex = parseInt(index, 10);

  if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= currentSkills.length) {
    res.status(400).json({ message: 'Invalid skill index' });
    return;
  }

  if (currentSkills.includes(skill)) {
    res.status(400).json({ message: 'Skill already exists' });
    return;
  }

  currentSkills[skillIndex] = skill;

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { skills: currentSkills },
  });

  res.status(200).json({
    message: 'Skill updated successfully',
    profile: updatedProfile,
  });
});

// Delete Skill
export const deleteSkill = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentSkills = profile.skills || [];
  const skillIndex = parseInt(index, 10);

  if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= currentSkills.length) {
    res.status(400).json({ message: 'Invalid skill index' });
    return;
  }

  const updatedSkills = currentSkills.filter((_, i) => i !== skillIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { skills: updatedSkills },
  });

  res.status(200).json({
    message: 'Skill deleted successfully',
    profile: updatedProfile,
  });
});