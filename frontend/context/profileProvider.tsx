"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';;

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
    const loadProfile = async () => {
      await getProfile();
    }
    loadProfile();
  }, []);

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
      setLoading(true);
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
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = async (index: number, education: Education) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile/education/${index}`, {
        method: "PUT",
        body: JSON.stringify(education),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update education");
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEducation = async (index: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile/education/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete education");
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const postExperience = async (experience: Experience) => {
    try {
      setLoading(true);
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
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateExperience = async (index: number, experience: Experience) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile/experience/${index}`, {
        method: "PUT",
        body: JSON.stringify(experience),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update experience");
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (index: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile/experience/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete experience");
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const postSkill = async (skill: string) => {
    try {
      setLoading(true);
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
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateSkill = async (index: number, skill: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile/skills/${index}`, {
        method: "PUT",
        body: JSON.stringify({ skill }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update skill");
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (index: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile/skills/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete skill");
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const postProject = async (project: Project) => {
    try {
      setLoading(true);
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
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (index: number, project: Project) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile/projects/${index}`, {
        method: "PUT",
        body: JSON.stringify(project),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update project");
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (index: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile/projects/${index}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete project");
      await getProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
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