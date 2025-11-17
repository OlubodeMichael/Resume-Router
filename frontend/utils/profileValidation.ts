/**
 * Utility function to check if a profile has meaningful data for resume generation
 */

interface Profile {
  skills?: string[];
  education?: Array<unknown>;
  experience?: Array<unknown>;
  projects?: Array<unknown>;
  achievements?: string[];
  certifications?: Array<unknown>;
  awardsHonors?: Array<unknown>;
  volunteer?: Array<unknown>;
  leadership?: Array<unknown>;
  publications?: Array<unknown>;
  references?: Array<unknown>;
  summary?: string | null;
  objective?: string | null;
}

/**
 * Checks if profile has at least one meaningful data field populated
 * @param profile - The profile object to check
 * @returns true if profile has data, false otherwise
 */
export function hasProfileData(profile: Profile | null): boolean {
  if (!profile) return false;

  // Check if any array fields have items
  const hasSkills = profile.skills && profile.skills.length > 0;
  const hasEducation = profile.education && profile.education.length > 0;
  const hasExperience = profile.experience && profile.experience.length > 0;
  const hasProjects = profile.projects && profile.projects.length > 0;
  const hasAchievements = profile.achievements && profile.achievements.length > 0;
  const hasCertifications = profile.certifications && profile.certifications.length > 0;
  const hasAwardsHonors = profile.awardsHonors && profile.awardsHonors.length > 0;
  const hasVolunteer = profile.volunteer && profile.volunteer.length > 0;
  const hasLeadership = profile.leadership && profile.leadership.length > 0;
  const hasPublications = profile.publications && profile.publications.length > 0;
  const hasReferences = profile.references && profile.references.length > 0;
  
  // Check if text fields have content
  const hasSummary = !!(profile.summary && typeof profile.summary === 'string' && profile.summary.trim().length > 0);
  const hasObjective = !!(profile.objective && typeof profile.objective === 'string' && profile.objective.trim().length > 0);

  // Return true if at least one field has data
  return (
    hasSkills ||
    hasEducation ||
    hasExperience ||
    hasProjects ||
    hasAchievements ||
    hasCertifications ||
    hasAwardsHonors ||
    hasVolunteer ||
    hasLeadership ||
    hasPublications ||
    hasReferences ||
    hasSummary ||
    hasObjective
  );
}

/**
 * Gets a user-friendly message about what profile data is missing
 * @param profile - The profile object to check
 * @returns A message string describing what's missing
 */
export function getProfileValidationMessage(profile: Profile | null): string {
  if (!profile) {
    return "Please complete your profile before generating a resume. Add at least one of: experience, education, skills, or projects.";
  }

  const missingFields: string[] = [];
  
  if (!profile.skills || profile.skills.length === 0) missingFields.push("skills");
  if (!profile.education || profile.education.length === 0) missingFields.push("education");
  if (!profile.experience || profile.experience.length === 0) missingFields.push("experience");
  if (!profile.projects || profile.projects.length === 0) missingFields.push("projects");

  if (missingFields.length === 0) {
    return ""; // Profile has data
  }

  return `Please add at least one of the following to your profile: ${missingFields.join(", ")}.`;
}

