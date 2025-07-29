"use client";
import { useState } from "react";
import { useProfile } from "@/context/profileProvider";
import ExperienceForm from "../Forms/ExperienceForm";
import EducationForm from "../Forms/EducationForm";
import ProjectForm from "../Forms/ProjectForm";
import SkillForm from "../Forms/SkillForm";
import { Plus } from "lucide-react";
import ExperienceCard from "../Cards/ExperienceCard";
import EducationCard from "../Cards/EducationCard";
import ProjectCard from "../Cards/ProjectCard";
import SkillCard from "../Cards/SkillCard";
import Loading from "../loading";

export default function Profile() {
  const { profile, loading, error } = useProfile();
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile</p>
          <p className="text-gray-600">{error}</p>
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
          <section className="mb-8">
            <div className="bg-white rounded-xl border-[1px] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Work Experience</h2>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  onClick={() => setShowExpForm(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <div className="space-y-4">
                {profile?.experience && profile.experience.length > 0 ? (
                  profile.experience.map((exp, idx) => (
                    <ExperienceCard
                      key={idx}
                      title={exp.title}
                      company={exp.company}
                      startDate={exp.startDate}
                      endDate={exp.endDate}
                      responsibilities={exp.responsibilities || []}
                      onEdit={() => {
                        // TODO: Implement edit functionality
                        console.log('Edit experience:', idx);
                      }}
                      onDelete={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete experience:', idx);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-3 text-sm sm:text-base">No work experience added yet</p>
                    <button
                      onClick={() => setShowExpForm(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      No experience added yet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Education Section */}
          <section className="mb-8">
            <div className="bg-white rounded-xl border-[1px] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Education</h2>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  onClick={() => setShowEduForm(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <div className="space-y-4">
                {profile?.education && profile.education.length > 0 ? (
                  profile.education.map((edu, idx) => (
                    <EducationCard
                      key={idx}
                      school={edu.school}
                      degree={edu.degree}
                      fieldOfStudy={edu.fieldOfStudy}
                      startDate={edu.startDate}
                      endDate={edu.endDate}
                      onEdit={() => {
                        // TODO: Implement edit functionality
                        console.log('Edit education:', idx);
                      }}
                      onDelete={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete education:', idx);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-3 text-sm sm:text-base">No education added yet</p>
                    <button
                      onClick={() => setShowEduForm(true)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      No education added yet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section className="mb-8">
            <div className="bg-white rounded-xl border-[1px] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Skills</h2>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  onClick={() => setShowSkillForm(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => {
                    // Handle both string and object skills for backward compatibility
                    const skillName = typeof skill === 'string' ? skill : (skill as {name: string})?.name || 'Unknown Skill';
                    return (
                      <SkillCard
                        key={idx}
                        name={skillName}
                        onEdit={() => {
                          // TODO: Implement edit functionality
                          console.log('Edit skill:', idx);
                        }}
                        onDelete={() => {
                          // TODO: Implement delete functionality
                          console.log('Delete skill:', idx);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-12 w-full">
                    <p className="text-gray-500 mb-3 text-sm sm:text-base">No skills added yet</p>
                    <button
                      onClick={() => setShowSkillForm(true)}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      Add your first skill →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section className="mb-8">
            <div className="bg-white rounded-xl border-[1px] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Projects</h2>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  onClick={() => setShowProjectForm(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <div className="space-y-4">
                {profile?.projects && profile.projects.length > 0 ? (
                  profile.projects.map((project, idx) => (
                    <ProjectCard
                      key={idx}
                      name={project.name}
                      description={project.description}
                      technologies={project.technologies || []}
                      url={project.url}
                      startDate={project.startDate}
                      endDate={project.endDate}
                      onEdit={() => {
                        // TODO: Implement edit functionality
                        console.log('Edit project:', idx);
                      }}
                      onDelete={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete project:', idx);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-3 text-sm sm:text-base">No projects added yet</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      {showExpForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4">
          <ExperienceForm onClose={() => setShowExpForm(false)} />
        </div>
      )}
      
      {showEduForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4">
          <EducationForm onClose={() => setShowEduForm(false)} />
        </div>
      )}
      
      {showSkillForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4">
          <SkillForm onClose={() => setShowSkillForm(false)} />
        </div>
      )}
      
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4">
          <ProjectForm onClose={() => setShowProjectForm(false)} />
        </div>
      )}
    </div>
  );
}