"use client";
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "./authProvider";

interface Profile {
  id: string;
  name: string;
  email: string;
  picture: string;
  skills?: string[]; // Changed back to string[]
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  achievements?: string[];
  certifications?: Certification[];
  awardsHonors?: AwardHonor[];
  volunteer?: Volunteer[];
  leadership?: Leadership[];
  publications?: Publication[];
  references?: Reference[];
  summary?: string | null;
  objective?: string | null;
}

interface Education {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  gpa?: string;
}

interface Experience {
  title: string;
  company: string;
  location?: string;
  responsibilities: string[];
  startDate: string;
  endDate?: string | null;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate?: string | null;
}

interface Certification {
  name?: string;
  issuer?: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  url?: string;
}

interface AwardHonor {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

interface Volunteer {
  org: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  impact?: string[];
  url?: string;
}

interface Leadership {
  org: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  achievements?: string[];
}

interface Publication {
  title: string;
  venue?: string;
  date?: string;
  url?: string;
  summary?: string;
}

interface Reference {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  relation?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  setProfile: (profile: Profile) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getProfile: () => void;
  updateProfile: (profile: Profile) => void;
  postEducation: (education: Education) => void;
  updateEducation: (index: number, education: Education) => void;
  deleteEducation: (index: number) => void;
  postExperience: (experience: Experience) => void;
  updateExperience: (index: number, experience: Experience) => void;
  deleteExperience: (index: number) => void;
  postSkill: (skill: string) => void;
  updateSkill: (index: number, skill: string) => void;
  deleteSkill: (index: number) => void;
  postBulkSkills: (skills: string[]) => void;
  postProject: (project: Project) => void;
  updateProject: (index: number, project: Project) => void;
  deleteProject: (index: number) => void;
  addCertification: (certification: Certification) => void;
  updateCertification: (index: number, certification: Certification) => void;
  deleteCertification: (index: number) => void;
  addAwardHonor: (award: AwardHonor) => void;
  updateAwardHonor: (index: number, award: AwardHonor) => void;
  deleteAwardHonor: (index: number) => void;
  addVolunteer: (volunteer: Volunteer) => void;
  updateVolunteer: (index: number, volunteer: Volunteer) => void;
  deleteVolunteer: (index: number) => void;
  addLeadership: (leadership: Leadership) => void;
  updateLeadership: (index: number, leadership: Leadership) => void;
  deleteLeadership: (index: number) => void;
  addPublication: (publication: Publication) => void;
  updatePublication: (index: number, publication: Publication) => void;
  deletePublication: (index: number) => void;
  addReference: (reference: Reference) => void;
  updateReference: (index: number, reference: Reference) => void;
  deleteReference: (index: number) => void;
  updateSummary: (summary: string | null) => void;
  updateObjective: (objective: string | null) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL 

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch profile");
      setProfile(data.profile);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    // Only fetch profile when user is authenticated and auth loading is complete
    if (user && !authLoading) {
      const loadProfile = async () => {
        await getProfile();
      }
      loadProfile();
    } else if (!authLoading && !user) {
      // If auth is complete but no user, set loading to false
      setLoading(false);
    }
  }, [user, authLoading, getProfile]);

  const updateProfile = async (profile: Profile) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "POST",
        body: JSON.stringify(profile),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update profile");
      setProfile(data.profile);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const postEducation = async (education: Education) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/education`, {
        method: "POST",
        body: JSON.stringify(education),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add education");
      
      // Update local state instead of refetching
      if (profile) {
        setProfile({
          ...profile,
          education: [...(profile.education || []), education]
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateEducation = async (index: number, education: Education) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/education/${index}`, {
        method: "PATCH",
        body: JSON.stringify(education),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update education");
      
      // Update local state instead of refetching
      if (profile && profile.education) {
        const updatedEducation = [...profile.education];
        updatedEducation[index] = education;
        setProfile({
          ...profile,
          education: updatedEducation
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteEducation = async (index: number) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/education/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete education");
      
      // Update local state instead of refetching
      if (profile && profile.education) {
        const updatedEducation = profile.education.filter((_, i) => i !== index);
        setProfile({
          ...profile,
          education: updatedEducation
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const postExperience = async (experience: Experience) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/experience`, {
        method: "POST",
        body: JSON.stringify(experience),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add experience");
      
      // Update local state instead of refetching
      if (profile) {
        setProfile({
          ...profile,
          experience: [...(profile.experience || []), experience]
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateExperience = async (index: number, experience: Experience) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/experience/${index}`, {
        method: "PATCH",
        body: JSON.stringify(experience),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update experience");
      
      // Update local state instead of refetching
      if (profile && profile.experience) {
        const updatedExperience = [...profile.experience];
        updatedExperience[index] = experience;
        setProfile({
          ...profile,
          experience: updatedExperience
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteExperience = async (index: number) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/experience/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete experience");
      
      // Update local state instead of refetching
      if (profile && profile.experience) {
        const updatedExperience = profile.experience.filter((_, i) => i !== index);
        setProfile({
          ...profile,
          experience: updatedExperience
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const postSkill = async (skill: string) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/skills`, {
        method: "POST",
        body: JSON.stringify({ skill }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add skill");
      
      // Update local state instead of refetching
      if (profile) {
        setProfile({
          ...profile,
          skills: [...(profile.skills || []), skill]
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateSkill = async (index: number, skill: string) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/skills/${index}`, {
        method: "PATCH",
        body: JSON.stringify({ skill }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update skill");
      
      // Update local state instead of refetching
      if (profile && profile.skills) {
        const updatedSkills = [...profile.skills];
        updatedSkills[index] = skill;
        setProfile({
          ...profile,
          skills: updatedSkills
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteSkill = async (index: number) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/skills/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete skill");
      
      // Update local state instead of refetching
      if (profile && profile.skills) {
        const updatedSkills = profile.skills.filter((_, i) => i !== index);
        setProfile({
          ...profile,
          skills: updatedSkills
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const postBulkSkills = async (skills: string[]) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/skills/bulk`, {
        method: "POST",
        body: JSON.stringify({ skills }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add skills");
      
      // Update local state instead of refetching
      if (profile) {
        setProfile({
          ...profile,
          skills: [...(profile.skills || []), ...skills]
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const postProject = async (project: Project) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/projects`, {
        method: "POST",
        body: JSON.stringify(project),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add project");
      
      // Update local state instead of refetching
      if (profile) {
        setProfile({
          ...profile,
          projects: [...(profile.projects || []), project]
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateProject = async (index: number, project: Project) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/projects/${index}`, {
        method: "PATCH",
        body: JSON.stringify(project),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update project");
      
      // Update local state instead of refetching
      if (profile && profile.projects) {
        const updatedProjects = [...profile.projects];
        updatedProjects[index] = project;
        setProfile({
          ...profile,
          projects: updatedProjects
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteProject = async (index: number) => {
    try {
      // Don't set global loading state for individual operations
      const response = await fetch(`${API_URL}/api/profile/projects/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete project");
      
      // Update local state instead of refetching
      if (profile && profile.projects) {
        const updatedProjects = profile.projects.filter((_, i) => i !== index);
        setProfile({
          ...profile,
          projects: updatedProjects
        });
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addCertification = async (certification: Certification) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/certifications`, {
        method: "POST",
        body: JSON.stringify(certification),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add certification");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateCertification = async (index: number, certification: Certification) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/certifications/${index}`, {
        method: "PATCH",
        body: JSON.stringify(certification),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update certification");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteCertification = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/certifications/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete certification");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addAwardHonor = async (award: AwardHonor) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/awards-honors`, {
        method: "POST",
        body: JSON.stringify(award),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add award");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateAwardHonor = async (index: number, award: AwardHonor) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/awards-honors/${index}`, {
        method: "PATCH",
        body: JSON.stringify(award),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update award");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteAwardHonor = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/awards-honors/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete award");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addVolunteer = async (volunteer: Volunteer) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/volunteer`, {
        method: "POST",
        body: JSON.stringify(volunteer),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add volunteer experience");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateVolunteer = async (index: number, volunteer: Volunteer) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/volunteer/${index}`, {
        method: "PATCH",
        body: JSON.stringify(volunteer),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update volunteer experience");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteVolunteer = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/volunteer/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete volunteer experience");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addLeadership = async (leadership: Leadership) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/leadership`, {
        method: "POST",
        body: JSON.stringify(leadership),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add leadership activity");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateLeadership = async (index: number, leadership: Leadership) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/leadership/${index}`, {
        method: "PATCH",
        body: JSON.stringify(leadership),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update leadership activity");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteLeadership = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/leadership/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete leadership activity");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addPublication = async (publication: Publication) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/publications`, {
        method: "POST",
        body: JSON.stringify(publication),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add publication");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updatePublication = async (index: number, publication: Publication) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/publications/${index}`, {
        method: "PATCH",
        body: JSON.stringify(publication),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update publication");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deletePublication = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/publications/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete publication");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addReference = async (reference: Reference) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/references`, {
        method: "POST",
        body: JSON.stringify(reference),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add reference");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateReference = async (index: number, reference: Reference) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/references/${index}`, {
        method: "PATCH",
        body: JSON.stringify(reference),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update reference");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const deleteReference = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/references/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete reference");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateSummary = async (summary: string | null) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/summary`, {
        method: "PATCH",
        body: JSON.stringify({ summary }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update summary");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateObjective = async (objective: string | null) => {
    try {
      const response = await fetch(`${API_URL}/api/profile/objective`, {
        method: "PATCH",
        body: JSON.stringify({ objective }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update objective");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        setProfile,
        setLoading,
        setError,
        getProfile,
        updateProfile,
        postEducation,
        updateEducation,
        deleteEducation,
        postExperience,
        updateExperience,
        deleteExperience,
        postSkill,
        updateSkill,
        deleteSkill,
        postBulkSkills,
        postProject,
        updateProject,
        deleteProject,
        addCertification,
        updateCertification,
        deleteCertification,
        addAwardHonor,
        updateAwardHonor,
        deleteAwardHonor,
        addVolunteer,
        updateVolunteer,
        deleteVolunteer,
        addLeadership,
        updateLeadership,
        deleteLeadership,
        addPublication,
        updatePublication,
        deletePublication,
        addReference,
        updateReference,
        deleteReference,
        updateSummary,
        updateObjective,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};