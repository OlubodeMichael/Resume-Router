"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
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
}

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

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate?: string | null;
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
  postProject: (project: Project) => void;
  updateProject: (index: number, project: Project) => void;
  deleteProject: (index: number) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const getProfile = async () => {
    try {
      setLoading(true);
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
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
  }, [user, authLoading]);

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
        postProject,
        updateProject,
        deleteProject,
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