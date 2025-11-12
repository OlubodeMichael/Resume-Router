import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import { formatDate } from '../../utils/formateDate';
import { rget, rset, rdel } from '../../utils/rcache';
import { Education, Experience, Project, Skill, Summary, Objective, Certification, Volunteer, Leadership, Publication, AwardHonor, Reference, Links } from '../types/section';

interface Profile {
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  summary: Summary;
  objective: Objective;
  certifications: Certification[];
}

const TTL_SEC = 60 * 60 * 24; // 24 hours
const KProfile = (userId: string) => `rr:v1:profile:${userId}`;

function sanitizeLinksInput(input: unknown): Links[] {
  if (!Array.isArray(input)) return [];

  const sanitized: Links[] = [];
  const seen = new Set<string>();

  input.forEach((item) => {
    if (!item || typeof item !== 'object') return;

    const rawName =
      typeof (item as any).name === 'string'
        ? (item as any).name
        : typeof (item as any).label === 'string'
        ? (item as any).label
        : '';
    const rawUrl = typeof (item as any).url === 'string' ? (item as any).url : '';

    const name = rawName.trim();
    const url = rawUrl.trim();

    if (!name || !url) return;

    const key = `${name.toLowerCase()}|${url.toLowerCase()}`;
    if (seen.has(key)) return;

    seen.add(key);
    sanitized.push({ name, url });
  });

  return sanitized;
}
async function writeThroughProfileCache(userId: string, profile: any) {
  await rset<any>(KProfile(userId), profile, { ttlSec: TTL_SEC });
}

async function invalidateProfileCache(userId: string) {
  await rdel(KProfile(userId));
}

// Get Profile
export const getProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
    }
    const key = KProfile(userId);

  const cached = await rget<any>(key);
  
  // Check if cached profile has all expected fields (to detect stale cache)
  const hasAllFields = cached && 
    cached.hasOwnProperty('skills') &&
    cached.hasOwnProperty('experience') &&
    cached.hasOwnProperty('education') &&
    cached.hasOwnProperty('projects') &&
    cached.hasOwnProperty('achievements') &&
    cached.hasOwnProperty('certifications') &&
    cached.hasOwnProperty('volunteer') &&
    cached.hasOwnProperty('leadership') &&
    cached.hasOwnProperty('publications') &&
    cached.hasOwnProperty('awardsHonors') &&
    cached.hasOwnProperty('references') &&
    cached.hasOwnProperty('summary') &&
    cached.hasOwnProperty('objective');

  if (cached && hasAllFields) {
    // Normalize cached profile to ensure all fields are present
    const normalizedProfile = {
      ...cached,
      skills: Array.isArray(cached.skills) ? cached.skills : [],
      experience: Array.isArray(cached.experience) ? cached.experience : [],
      education: Array.isArray(cached.education) ? cached.education : [],
      projects: Array.isArray(cached.projects) ? cached.projects : [],
      achievements: Array.isArray(cached.achievements) ? cached.achievements : [],
      certifications: Array.isArray(cached.certifications) ? cached.certifications : [],
      volunteer: Array.isArray(cached.volunteer) ? cached.volunteer : [],
      leadership: Array.isArray(cached.leadership) ? cached.leadership : [],
      publications: Array.isArray(cached.publications) ? cached.publications : [],
      awardsHonors: Array.isArray(cached.awardsHonors) ? cached.awardsHonors : [],
      references: Array.isArray(cached.references) ? cached.references : [],
      summary: cached.summary ?? null,
      objective: cached.objective ?? null,
    };
    res.status(200).json({
      message: 'Profile fetched successfully',
      profile: normalizedProfile,
    });
    return;
  }

  // If cache is stale or missing, fetch from database
  // Also invalidate stale cache
  if (cached && !hasAllFields) {
    await invalidateProfileCache(userId);
  }

  let profile = await prisma.profile.findUnique({
    where: { userId },
  });

  // If profile doesn't exist, create an empty one for new users
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        achievements: [],
        links: [],
        certifications: [],
        volunteer: [],
        leadership: [],
        publications: [],
        awardsHonors: [],
        references: [],
        summary: null,
        objective: null,
        createdAt: new Date(),
      } as any,
    });
  }

  // Normalize profile to ensure all fields are present
  const normalizedProfile = {
    ...profile,
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    education: Array.isArray(profile.education) ? profile.education : [],
    projects: Array.isArray(profile.projects) ? profile.projects : [],
    achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
    certifications: Array.isArray((profile as any).certifications) ? (profile as any).certifications : [],
    volunteer: Array.isArray((profile as any).volunteer) ? (profile as any).volunteer : [],
    leadership: Array.isArray((profile as any).leadership) ? (profile as any).leadership : [],
    publications: Array.isArray((profile as any).publications) ? (profile as any).publications : [],
    awardsHonors: Array.isArray((profile as any).awardsHonors) ? (profile as any).awardsHonors : [],
    references: Array.isArray((profile as any).references) ? (profile as any).references : [],
    summary: (profile as any).summary ?? null,
    objective: (profile as any).objective ?? null,
  };

  await rset<any>(key, normalizedProfile, { ttlSec: TTL_SEC });

  res.status(200).json({
    message: 'Profile fetched successfully',
    profile: normalizedProfile,
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
  await writeThroughProfileCache(userId, profile);

  res.status(200).json({
    message: 'Profile saved successfully',
    profile,
  });
});

// Add Education Entry
export const addEducationEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { school, degree, fieldOfStudy, location, startDate, endDate, gpa } = req.body;

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
      location,
      startDate: formatDate(startDate),
      endDate: endDate ? formatDate(endDate) : null,
      gpa,
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

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Education entry added successfully',
    profile: updatedProfile,
  });
});

// Update Education Entry
export const updateEducationEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { school, degree, fieldOfStudy, location, startDate, endDate, gpa } = req.body;

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
    location,
    startDate: formatDate(startDate),
    endDate: endDate ? formatDate(endDate) : null,
    gpa,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { education: currentEducation as any },
  });

  await writeThroughProfileCache(userId, updatedProfile);

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

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Education entry deleted successfully',
    profile: updatedProfile,
  });
});

// Add Experience Entry
export const addExperienceEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { title, company, location, responsibilities, startDate, endDate } = req.body;

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
      location,
      responsibilities,
      startDate: formatDate(startDate),
      endDate: endDate ? formatDate(endDate) : null,
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

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Experience entry added successfully',
    profile: updatedProfile,
  });
});

// Update Experience Entry
export const updateExperienceEntry = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { title, company, location, responsibilities, startDate, endDate } = req.body;

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
    location,
    responsibilities,
    startDate: formatDate(startDate),
    endDate: endDate ? formatDate(endDate) : null,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { experience: currentExperience as any },
  });

  await writeThroughProfileCache(userId, updatedProfile);

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

  await writeThroughProfileCache(userId, updatedProfile);

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
  const currentSkills = Array.isArray(profile?.skills) ? profile.skills : [];

  // Check if skill already exists
  if (currentSkills.includes(skill)) {
    res.status(400).json({ message: 'Skill already exists' });
    return;
  }

  const newSkills = [...currentSkills, skill];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { skills: newSkills as any },
    create: {
      userId,
      skills: newSkills as any,
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      createdAt: new Date(),
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

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

  const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const skillIndex = parseInt(index, 10);

  if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= currentSkills.length) {
    res.status(400).json({ message: 'Invalid skill index' });
    return;
  }

  // Check if skill already exists (excluding current skill)
  const existingSkill = currentSkills.find((s, i) => s === skill && i !== skillIndex);
  if (existingSkill) {
    res.status(400).json({ message: 'Skill already exists' });
    return;
  }

  currentSkills[skillIndex] = skill;

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { skills: currentSkills as any },
  });

  await writeThroughProfileCache(userId, updatedProfile);

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

  const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const skillIndex = parseInt(index, 10);

  if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= currentSkills.length) {
    res.status(400).json({ message: 'Invalid skill index' });
    return;
  }

  const updatedSkills = currentSkills.filter((_, i) => i !== skillIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { skills: updatedSkills as any },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Skill deleted successfully',
    profile: updatedProfile,
  });
});

// Add Bulk Skills
export const addBulkSkills = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { skills } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    res.status(400).json({ message: 'Skills array is required and must not be empty' });
    return;
  }

  // Validate all skills are strings
  const invalidSkills = skills.filter(skill => typeof skill !== 'string' || !skill.trim());
  if (invalidSkills.length > 0) {
    res.status(400).json({ message: 'All skills must be non-empty strings' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentSkills = Array.isArray(profile?.skills) ? profile.skills : [];

  // Filter out duplicates and trim skills
  const trimmedSkills = skills.map(skill => skill.trim());
  const newSkills = trimmedSkills.filter(skill => !currentSkills.includes(skill));
  
  if (newSkills.length === 0) {
    res.status(400).json({ message: 'All skills already exist' });
    return;
  }

  const updatedSkills = [...currentSkills, ...newSkills];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { skills: updatedSkills as any },
    create: {
      userId,
      skills: updatedSkills as any,
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      createdAt: new Date(),
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: `${newSkills.length} skills added successfully`,
    profile: updatedProfile,
  });
});

export const addProject = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { name, description, technologies, url, startDate, endDate } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required' });
    return;
  }

  if (technologies && !Array.isArray(technologies)) {
    res.status(400).json({ message: 'Technologies must be an array' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentProjects = Array.isArray(profile?.projects) ? (profile.projects as unknown as Project[]) : [];

  const newProject: Project[] = [
    ...currentProjects,
    {
      name,
      description,
      technologies: technologies || [],
      url: url || undefined,
      startDate: startDate ? formatDate(startDate) : undefined,
      endDate: endDate ? formatDate(endDate) : null,
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { projects: newProject as any },
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: newProject as any,
      achievements: [],
      createdAt: new Date(),
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Project added successfully',
    profile: updatedProfile,
  });
});

export const updateProject = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { name, description, technologies, url, startDate, endDate } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required' });
    return;
  }

  if (technologies && !Array.isArray(technologies)) {
    res.status(400).json({ message: 'Technologies must be an array' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentProjects = Array.isArray(profile.projects) ? (profile.projects as unknown as Project[]) : [];
  const projectIndex = parseInt(index, 10);

  if (isNaN(projectIndex) || projectIndex < 0 || projectIndex >= currentProjects.length) {
    res.status(400).json({ message: 'Invalid project index' });
    return;
  }

  currentProjects[projectIndex] = {
    name,
    description,
    technologies: technologies || [],
    url: url || undefined,
    startDate: startDate ? formatDate(startDate) : undefined,
    endDate: endDate ? formatDate(endDate) : null,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { projects: currentProjects as any },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Project updated successfully',
    profile: updatedProfile,
  });
});

export const deleteProject = catchAsync(async (req: Request, res: Response): Promise<void> => {
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

  const currentProjects = Array.isArray(profile.projects) ? (profile.projects as unknown as Project[]) : [];
  const projectIndex = parseInt(index, 10);

  if (isNaN(projectIndex) || projectIndex < 0 || projectIndex >= currentProjects.length) {
    res.status(400).json({ message: 'Invalid project index' });
    return;
  }

  const updatedProjects = currentProjects.filter((_, i) => i !== projectIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { projects: updatedProjects as any },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Project deleted successfully',
    profile: updatedProfile,
  });
});




// Certifications
export const addCertification = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { name, issuer, date, expirationDate, credentialId, url } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!name || !date) {
    res.status(400).json({ message: 'Name and date are required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentCertifications = Array.isArray((profile as any)?.certifications) ? ((profile as any).certifications as unknown as Certification[]) : [];

  const newCertification: Certification[] = [
    ...currentCertifications,
    {
      name,
      issuer,
      date: formatDate(date),
      expirationDate: expirationDate ? formatDate(expirationDate) : undefined,
      credentialId,
      url,
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { certifications: newCertification as any } as any,
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      certifications: newCertification as any,
      createdAt: new Date(),
    } as any,
    select: {
      certifications: true,
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Certification added successfully',
    profile: updatedProfile,
  });
});

export const updateCertification = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { name, issuer, date, expirationDate, credentialId, url } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!name || !date) {
    res.status(400).json({ message: 'Name and date are required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentCertifications = Array.isArray((profile as any).certifications) ? ((profile as any).certifications as unknown as Certification[]) : [];
  const certificationIndex = parseInt(index, 10);

  if (isNaN(certificationIndex) || certificationIndex < 0 || certificationIndex >= currentCertifications.length) {
    res.status(400).json({ message: 'Invalid certification index' });
    return;
  }

  currentCertifications[certificationIndex] = {
    name,
    issuer,
    date: formatDate(date),
    expirationDate: expirationDate ? formatDate(expirationDate) : undefined,
    credentialId,
    url,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { certifications: currentCertifications as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Certification updated successfully',
    profile: updatedProfile,
  });
});

export const deleteCertification = catchAsync(async (req: Request, res: Response): Promise<void> => {
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

  const currentCertifications = Array.isArray((profile as any).certifications) ? ((profile as any).certifications as unknown as Certification[]) : [];
  const certificationIndex = parseInt(index, 10);

  if (isNaN(certificationIndex) || certificationIndex < 0 || certificationIndex >= currentCertifications.length) {
    res.status(400).json({ message: 'Invalid certification index' });
    return;
  }

  const updatedCertifications = currentCertifications.filter((_, i) => i !== certificationIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { certifications: updatedCertifications as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Certification deleted successfully',
    profile: updatedProfile,
  });
});

// Awards & Honors
export const addAwardHonor = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { title, issuer, date, description } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!title) {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentAwardsHonors = Array.isArray((profile as any)?.awardsHonors) ? ((profile as any).awardsHonors as unknown as AwardHonor[]) : [];

  const newAwardHonor: AwardHonor[] = [
    ...currentAwardsHonors,
    {
      title,
      issuer,
      date: date ? formatDate(date) : undefined,
      description,
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { awardsHonors: newAwardHonor as any } as any,
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      awardsHonors: newAwardHonor as any,
      createdAt: new Date(),
    } as any,
    select: {
      awardsHonors: true,
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Award/Honor added successfully',
    profile: updatedProfile,
  });
});

export const updateAwardHonor = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { title, issuer, date, description } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!title) {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentAwardsHonors = Array.isArray((profile as any).awardsHonors) ? ((profile as any).awardsHonors as unknown as AwardHonor[]) : [];
  const awardIndex = parseInt(index, 10);

  if (isNaN(awardIndex) || awardIndex < 0 || awardIndex >= currentAwardsHonors.length) {
    res.status(400).json({ message: 'Invalid award/honor index' });
    return;
  }

  currentAwardsHonors[awardIndex] = {
    title,
    issuer,
    date: date ? formatDate(date) : undefined,
    description,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { awardsHonors: currentAwardsHonors as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Award/Honor updated successfully',
    profile: updatedProfile,
  });
});

export const deleteAwardHonor = catchAsync(async (req: Request, res: Response): Promise<void> => {
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

  const currentAwardsHonors = Array.isArray((profile as any).awardsHonors) ? ((profile as any).awardsHonors as unknown as AwardHonor[]) : [];
  const awardIndex = parseInt(index, 10);

  if (isNaN(awardIndex) || awardIndex < 0 || awardIndex >= currentAwardsHonors.length) {
    res.status(400).json({ message: 'Invalid award/honor index' });
    return;
  }

  const updatedAwardsHonors = currentAwardsHonors.filter((_, i) => i !== awardIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { awardsHonors: updatedAwardsHonors as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Award/Honor deleted successfully',
    profile: updatedProfile,
  });
});

// Volunteer Experience
export const addVolunteer = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { org, role, startDate, endDate, impact, url } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!org) {
    res.status(400).json({ message: 'Organization is required' });
    return;
  }

  if (impact && !Array.isArray(impact)) {
    res.status(400).json({ message: 'Impact must be an array' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentVolunteers = Array.isArray((profile as any)?.volunteer) ? ((profile as any).volunteer as unknown as Volunteer[]) : [];

  const newVolunteer: Volunteer[] = [
    ...currentVolunteers,
    {
      org,
      role,
      startDate: startDate ? formatDate(startDate) : undefined,
      endDate: endDate ? formatDate(endDate) : undefined,
      impact: impact || [],
      url,
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { volunteer: newVolunteer as any } as any,
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      volunteer: newVolunteer as any,
      createdAt: new Date(),
    } as any,
    select: {
      volunteer: true,
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Volunteer experience added successfully',
    profile: updatedProfile,
  });
});

export const updateVolunteer = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { org, role, startDate, endDate, impact, url } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!org) {
    res.status(400).json({ message: 'Organization is required' });
    return;
  }

  if (impact && !Array.isArray(impact)) {
    res.status(400).json({ message: 'Impact must be an array' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentVolunteers = Array.isArray((profile as any).volunteer) ? ((profile as any).volunteer as unknown as Volunteer[]) : [];
  const volunteerIndex = parseInt(index, 10);

  if (isNaN(volunteerIndex) || volunteerIndex < 0 || volunteerIndex >= currentVolunteers.length) {
    res.status(400).json({ message: 'Invalid volunteer index' });
    return;
  }

  currentVolunteers[volunteerIndex] = {
    org,
    role,
    startDate: startDate ? formatDate(startDate) : undefined,
    endDate: endDate ? formatDate(endDate) : undefined,
    impact: impact || [],
    url,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { volunteer: currentVolunteers as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Volunteer experience updated successfully',
    profile: updatedProfile,
  });
});

export const deleteVolunteer = catchAsync(async (req: Request, res: Response): Promise<void> => {
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

  const currentVolunteers = Array.isArray((profile as any).volunteer) ? ((profile as any).volunteer as unknown as Volunteer[]) : [];
  const volunteerIndex = parseInt(index, 10);

  if (isNaN(volunteerIndex) || volunteerIndex < 0 || volunteerIndex >= currentVolunteers.length) {
    res.status(400).json({ message: 'Invalid volunteer index' });
    return;
  }

  const updatedVolunteers = currentVolunteers.filter((_, i) => i !== volunteerIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { volunteer: updatedVolunteers as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Volunteer experience deleted successfully',
    profile: updatedProfile,
  });
});

// Leadership
export const addLeadershipActivity = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { org, position, startDate, endDate, achievements } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!org) {
    res.status(400).json({ message: 'Organization is required' });
    return;
  }

  if (achievements && !Array.isArray(achievements)) {
    res.status(400).json({ message: 'Achievements must be an array' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentLeadership = Array.isArray((profile as any)?.leadership) ? ((profile as any).leadership as unknown as Leadership[]) : [];

  const newLeadership: Leadership[] = [
    ...currentLeadership,
    {
      org,
      position,
      startDate: startDate ? formatDate(startDate) : undefined,
      endDate: endDate ? formatDate(endDate) : undefined,
      achievements: achievements || [],
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { leadership: newLeadership as any } as any,
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      leadership: newLeadership as any,
      createdAt: new Date(),
    } as any,
    select: {
      leadership: true,
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Leadership activity added successfully',
    profile: updatedProfile,
  });
});

export const updateLeadershipActivity = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { org, position, startDate, endDate, achievements } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!org) {
    res.status(400).json({ message: 'Organization is required' });
    return;
  }

  if (achievements && !Array.isArray(achievements)) {
    res.status(400).json({ message: 'Achievements must be an array' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentLeadership = Array.isArray((profile as any).leadership) ? ((profile as any).leadership as unknown as Leadership[]) : [];
  const leadershipIndex = parseInt(index, 10);

  if (isNaN(leadershipIndex) || leadershipIndex < 0 || leadershipIndex >= currentLeadership.length) {
    res.status(400).json({ message: 'Invalid leadership index' });
    return;
  }

  currentLeadership[leadershipIndex] = {
    org,
    position,
    startDate: startDate ? formatDate(startDate) : undefined,
    endDate: endDate ? formatDate(endDate) : undefined,
    achievements: achievements || [],
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { leadership: currentLeadership as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Leadership activity updated successfully',
    profile: updatedProfile,
  });
});

export const deleteLeadershipActivity = catchAsync(async (req: Request, res: Response): Promise<void> => {
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

  const currentLeadership = Array.isArray((profile as any).leadership) ? ((profile as any).leadership as unknown as Leadership[]) : [];
  const leadershipIndex = parseInt(index, 10);

  if (isNaN(leadershipIndex) || leadershipIndex < 0 || leadershipIndex >= currentLeadership.length) {
    res.status(400).json({ message: 'Invalid leadership index' });
    return;
  }

  const updatedLeadership = currentLeadership.filter((_, i) => i !== leadershipIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { leadership: updatedLeadership as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Leadership activity deleted successfully',
    profile: updatedProfile,
  });
});

// Publications
export const addPublication = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { title, venue, date, url, summary } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!title) {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentPublications = Array.isArray((profile as any)?.publications) ? ((profile as any).publications as unknown as Publication[]) : [];

  const newPublication: Publication[] = [
    ...currentPublications,
    {
      title,
      venue,
      date: date ? formatDate(date) : undefined,
      url,
      summary,
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { publications: newPublication as any } as any,
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      publications: newPublication as any,
      createdAt: new Date(),
    } as any,
    select: {
      publications: true,
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Publication added successfully',
    profile: updatedProfile,
  });
});

export const updatePublication = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { title, venue, date, url, summary } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!title) {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentPublications = Array.isArray((profile as any).publications) ? ((profile as any).publications as unknown as Publication[]) : [];
  const publicationIndex = parseInt(index, 10);

  if (isNaN(publicationIndex) || publicationIndex < 0 || publicationIndex >= currentPublications.length) {
    res.status(400).json({ message: 'Invalid publication index' });
    return;
  }

  currentPublications[publicationIndex] = {
    title,
    venue,
    date: date ? formatDate(date) : undefined,
    url,
    summary,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { publications: currentPublications as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Publication updated successfully',
    profile: updatedProfile,
  });
});

export const deletePublication = catchAsync(async (req: Request, res: Response): Promise<void> => {
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

  const currentPublications = Array.isArray((profile as any).publications) ? ((profile as any).publications as unknown as Publication[]) : [];
  const publicationIndex = parseInt(index, 10);

  if (isNaN(publicationIndex) || publicationIndex < 0 || publicationIndex >= currentPublications.length) {
    res.status(400).json({ message: 'Invalid publication index' });
    return;
  }

  const updatedPublications = currentPublications.filter((_, i) => i !== publicationIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { publications: updatedPublications as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Publication deleted successfully',
    profile: updatedProfile,
  });
});

// References
export const addReference = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { name, title, company, email, phone, relation } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!name) {
    res.status(400).json({ message: 'Name is required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentReferences = Array.isArray((profile as any)?.references) ? ((profile as any).references as unknown as Reference[]) : [];

  const newReference: Reference[] = [
    ...currentReferences,
    {
      name,
      title,
      company,
      email,
      phone,
      relation,
    },
  ];

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { references: newReference as any } as any,
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      references: newReference as any,
      createdAt: new Date(),
    } as any,
    select: {
      references: true,
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Reference added successfully',
    profile: updatedProfile,
  });
});

export const updateReference = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { index } = req.params;
  const { name, title, company, email, phone, relation } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!name) {
    res.status(400).json({ message: 'Name is required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  const currentReferences = Array.isArray((profile as any).references) ? ((profile as any).references as unknown as Reference[]) : [];
  const referenceIndex = parseInt(index, 10);

  if (isNaN(referenceIndex) || referenceIndex < 0 || referenceIndex >= currentReferences.length) {
    res.status(400).json({ message: 'Invalid reference index' });
    return;
  }

  currentReferences[referenceIndex] = {
    name,
    title,
    company,
    email,
    phone,
    relation,
  };

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { references: currentReferences as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Reference updated successfully',
    profile: updatedProfile,
  });
});

export const deleteReference = catchAsync(async (req: Request, res: Response): Promise<void> => {
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

  const currentReferences = Array.isArray((profile as any).references) ? ((profile as any).references as unknown as Reference[]) : [];
  const referenceIndex = parseInt(index, 10);

  if (isNaN(referenceIndex) || referenceIndex < 0 || referenceIndex >= currentReferences.length) {
    res.status(400).json({ message: 'Invalid reference index' });
    return;
  }

  const updatedReferences = currentReferences.filter((_, i) => i !== referenceIndex);

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: { references: updatedReferences as any } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Reference deleted successfully',
    profile: updatedProfile,
  });
});

// Summary
export const updateSummary = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { summary } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (summary !== undefined && typeof summary !== 'string') {
    res.status(400).json({ message: 'Summary must be a string' });
    return;
  }

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { summary: summary || null } as any,
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      summary: summary || null,
      createdAt: new Date(),
    } as any,
    select: {
      summary: true,
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Summary updated successfully',
    profile: updatedProfile,
  });
});

// Objective
export const updateObjective = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { objective } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (objective !== undefined && typeof objective !== 'string') {
    res.status(400).json({ message: 'Objective must be a string' });
    return;
  }

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { objective: objective || null } as any,
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      objective: objective || null,
      createdAt: new Date(),
    } as any,
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Objective updated successfully',
    profile: updatedProfile,
  });
});

// Get Certifications
export const getCertifications = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const certifications = Array.isArray((profile as any)?.certifications) ? ((profile as any).certifications as unknown as Certification[]) : [];

  res.status(200).json({
    message: 'Certifications fetched successfully',
    certifications,
  });
});

// Get Awards & Honors
export const getAwardsHonors = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const awardsHonors = Array.isArray((profile as any)?.awardsHonors) ? ((profile as any).awardsHonors as unknown as AwardHonor[]) : [];

  res.status(200).json({
    message: 'Awards & Honors fetched successfully',
    awardsHonors,
  });
});

// Get Volunteer Experience
export const getVolunteers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const volunteers = Array.isArray((profile as any)?.volunteer) ? ((profile as any).volunteer as unknown as Volunteer[]) : [];

  res.status(200).json({
    message: 'Volunteer experience fetched successfully',
    volunteers,
  });
});

// Get Leadership
export const getLeadership = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const leadership = Array.isArray((profile as any)?.leadership) ? ((profile as any).leadership as unknown as Leadership[]) : [];

  res.status(200).json({
    message: 'Leadership activities fetched successfully',
    leadership,
  });
});

// Get Publications
export const getPublications = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const publications = Array.isArray((profile as any)?.publications) ? ((profile as any).publications as unknown as Publication[]) : [];

  res.status(200).json({
    message: 'Publications fetched successfully',
    publications,
  });
});

// Get References
export const getReferences = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const references = Array.isArray((profile as any)?.references) ? ((profile as any).references as unknown as Reference[]) : [];

  res.status(200).json({
    message: 'References fetched successfully',
    references,
  });
});

// Get Summary
export const getSummary = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const summary = (profile as any)?.summary || null;

  res.status(200).json({
    message: 'Summary fetched successfully',
    summary,
  });
});

// Get Objective
export const getObjective = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const objective = (profile as any)?.objective || null;

  res.status(200).json({
    message: 'Objective fetched successfully',
    objective,
  });
});

export const addLinks = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { links } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }
  if (!Array.isArray(links)) {
    res.status(400).json({ message: 'Links must be an array of { name, url } objects' });
    return;
  }

  const sanitizedLinks = sanitizeLinksInput(links);

  if (!sanitizedLinks.length) {
    res.status(400).json({ message: 'At least one valid link with both name and url is required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const currentLinks = sanitizeLinksInput((profile as any)?.links);

  const existingKeys = new Set(
    currentLinks.map((link) => `${link.name.toLowerCase()}|${link.url.toLowerCase()}`)
  );

  const mergedLinks = [...currentLinks];
  sanitizedLinks.forEach((link) => {
    const key = `${link.name.toLowerCase()}|${link.url.toLowerCase()}`;
    if (existingKeys.has(key)) {
      return;
    }
    existingKeys.add(key);
    mergedLinks.push(link);
  });

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { links: mergedLinks as any },
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      links: mergedLinks as any,
      createdAt: new Date(),
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Links added successfully',
    links: mergedLinks,
  });
});

export const getLinks = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { links: true },
  });

  const sanitizedLinks = sanitizeLinksInput(profile?.links ?? []);

  res.status(200).json({
    message: 'Links fetched successfully',
    links: sanitizedLinks,
  });
});

export const updateLinks = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  const { links } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  if (!Array.isArray(links)) {
    res.status(400).json({ message: 'Links must be an array of { name, url } objects' });
    return;
  }

  const sanitizedLinks = sanitizeLinksInput(links);

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: { links: sanitizedLinks as any },
    create: {
      userId,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      achievements: [],
      links: sanitizedLinks as any,
      createdAt: new Date(),
    },
  });

  await writeThroughProfileCache(userId, updatedProfile);

  res.status(200).json({
    message: 'Links updated successfully',
    links: sanitizedLinks,
  });
});


export const deleteLinks = catchAsync(async (req: Request, res: Response): Promise<void> => {})

export const addCourses = catchAsync(async (req: Request, res: Response): Promise<void> => {})