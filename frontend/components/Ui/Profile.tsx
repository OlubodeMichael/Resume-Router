"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
import ExperienceForm from "../Forms/ExperienceForm";
import EducationForm from "../Forms/EducationForm";
import ProjectForm from "../Forms/ProjectForm";
import SkillForm from "../Forms/SkillForm";
import MultiSkillForm from "../Forms/MultiSkillForm";
import Experience from "../Profile/Experience";
import Education from "../Profile/Education";
import Project from "../Profile/Project";
import Skill from "../Profile/Skill";
import Loading from "../loading";

export default function Profile() {
  const { profile, loading, error, deleteEducation, deleteExperience, deleteProject, deleteSkill } = useProfile();
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  
  // Education edit state
  const [editingEducation, setEditingEducation] = useState<{
    index: number;
    data: {
      school: string;
      degree: string;
      fieldOfStudy: string;
      location: string;
      startDate: string;
      endDate?: string | null;
      gpa: string;
    };
  } | null>(null);

  // Experience edit state
  const [editingExperience, setEditingExperience] = useState<{
    index: number;
    data: {
      title: string;
      company: string;
      location?: string;
      responsibilities: string[];
      startDate: string;
      endDate?: string | null;
    };
  } | null>(null);

  // Project edit state
  const [editingProject, setEditingProject] = useState<{
    index: number;
    data: {
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      startDate: string;
      endDate?: string | null;
    };
  } | null>(null);
  // Skill edit state
  const [editingSkill, setEditingSkill] = useState<{
    index: number;
    data: {
      name: string;
    };
  } | null>(null);

  const handleEditEducation = (index: number) => {
    if (profile?.education && profile.education[index]) {
      const education = profile.education[index];
      setEditingEducation({
        index,
        data: {
          school: education.school,
          degree: education.degree,
          fieldOfStudy: education.fieldOfStudy || "",
          location: education.location || "",
          startDate: education.startDate,
          endDate: education.endDate,
          gpa: education.gpa || "",
        },
      });
      setShowEduForm(true);
    }
  };

  const handleDeleteEducation = async (index: number) => {
    if (confirm("Are you sure you want to delete this education entry?")) {
      try {
        await deleteEducation(index);
      } catch (error) {
        console.error("Failed to delete education:", error);
      }
    }
  };

  const handleCloseEducationForm = () => {
    setShowEduForm(false);
    setEditingEducation(null);
  };

  const handleEditExperience = (index: number) => {
    if (profile?.experience && profile.experience[index]) {
      const experience = profile.experience[index];
      setEditingExperience({
        index,
        data: {
          title: experience.title,
          company: experience.company,
          location: experience.location,
          responsibilities: experience.responsibilities || [],
          startDate: experience.startDate,
          endDate: experience.endDate,
        },
      });
      setShowExpForm(true);
    }
  };

  const handleDeleteExperience = async (index: number) => {
    if (confirm("Are you sure you want to delete this experience entry?")) {
      try {
        await deleteExperience(index);
      } catch (error) {
        console.error("Failed to delete experience:", error);
      }
    }
  };

  const handleCloseExperienceForm = () => {
    setShowExpForm(false);
    setEditingExperience(null);
  };

  const handleEditProject = (index: number) => {
    if (profile?.projects && profile.projects[index]) {
      const project = profile.projects[index];
      setEditingProject({
        index,
        data: {
          name: project.name,
          description: project.description,
          technologies: project.technologies || [],
          url: project.url,
          startDate: project.startDate,
          endDate: project.endDate,
        },
      });
      setShowProjectForm(true);
    }
  };

  const handleDeleteProject = async (index: number) => {
    if (confirm("Are you sure you want to delete this project entry?")) {
      try {
        await deleteProject(index);
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };
  const handleEditSkill = (index: number) => {
    if (profile?.skills && profile.skills[index]) {
      const skill = profile.skills[index];
      setEditingSkill({
        index,
        data: {
          name: skill,
        },
      });
      setShowSkillForm(true);
    }
  };
  const handleDeleteSkill = async (index: number) => {
    if (confirm("Are you sure you want to delete this skill entry?")) {
      try {
        await deleteSkill(index);
      } catch (error) {
        console.error("Failed to delete skill:", error);
      }
    }
  };

  const handleCloseProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleCloseSkillForm = () => {
    setShowSkillForm(false);
    setEditingSkill(null);
  };

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load profile</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re having trouble loading your profile. This might be a temporary issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Width Profile Editor */}
      
      <div className="w-full px-3 sm:px-6 md:px-8 lg:px-12">
        {/* Profile Content */}
        <div className="py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8 bg-white rounded-xl border-[1px] p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-sm sm:text-base text-gray-600">Build your professional profile by adding your experience, education, skills, and projects.</p>
          </div>


          {/* Experience Section */}
          <Experience
            profile={profile}
            setShowExpForm={setShowExpForm}
            handleEditExperience={handleEditExperience}
            handleDeleteExperience={handleDeleteExperience}
          />

          {/* Education Section */}
          <Education
            profile={profile}
            setShowEduForm={setShowEduForm}
            handleEditEducation={handleEditEducation}
            handleDeleteEducation={handleDeleteEducation}
          />

          {/* Skills Section */}
          <Skill
            profile={profile}
            setShowSkillForm={setShowSkillForm}
            handleEditSkill={handleEditSkill}
            handleDeleteSkill={handleDeleteSkill}
          />

          {/* Projects Section */}
          <Project
            profile={profile}
            setShowProjectForm={setShowProjectForm}
            handleEditProject={handleEditProject}
            handleDeleteProject={handleDeleteProject}
          />
        </div>
      </div>

      {/* Modals */}
      {showExpForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <ExperienceForm 
              onClose={handleCloseExperienceForm}
              initial={editingExperience?.data}
              editIndex={editingExperience?.index ?? null}
            />
          </div>
        </div>
      )}
      
      {showEduForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <EducationForm 
              onClose={handleCloseEducationForm}
              initial={editingEducation?.data}
              editIndex={editingEducation?.index ?? null}
            />
          </div>
        </div>
      )}
      
      {showSkillForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            {editingSkill ? (
              <SkillForm 
                onClose={handleCloseSkillForm}
                initial={editingSkill?.data}
                editIndex={editingSkill?.index ?? null}
              />
            ) : (
              <MultiSkillForm 
                onClose={handleCloseSkillForm}
                existingSkills={profile?.skills || []}
              />
            )}
          </div>
        </div>
      )}
      
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <ProjectForm 
              onClose={handleCloseProjectForm}
              initial={editingProject?.data}
              editIndex={editingProject?.index ?? null}
            />
          </div>
        </div>
      )}
    </div>
  );
}