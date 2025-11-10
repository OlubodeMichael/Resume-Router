"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useProfile } from "@/hooks/profileProvider";
import { useResume, ParsedResumeResult } from "@/hooks/resumeProvider";
import ExperienceForm from "../Forms/ExperienceForm";
import EducationForm from "../Forms/EducationForm";
import ProjectForm from "../Forms/ProjectForm";
import SkillForm from "../Forms/SkillForm";
import MultiSkillForm from "../Forms/MultiSkillForm";
import CertificationForm from "../Forms/CertificationForm";
import AwardHonorForm from "../Forms/AwardHonorForm";
import VolunteerForm from "../Forms/VolunteerForm";
import LeadershipForm from "../Forms/LeadershipForm";
import PublicationForm from "../Forms/PublicationForm";
import ReferenceForm from "../Forms/ReferenceForm";
import SummaryForm from "../Forms/SummaryForm";
import ObjectiveForm from "../Forms/ObjectiveForm";
import Experience from "../Profile/Experience";
import Education from "../Profile/Education";
import Project from "../Profile/Project";
import Skill from "../Profile/Skill";
import CertificationSection from "../Profile/Certification";
import AwardsHonors from "../Profile/AwardsHonors";
import VolunteerSection from "../Profile/Volunteer";
import LeadershipSection from "../Profile/Leadership";
import PublicationSection from "../Profile/Publication";
import ReferenceSection from "../Profile/Reference";
import SummarySection from "../Profile/Summary";
import ObjectiveSection from "../Profile/Objective";
import Loading from "../loading";

export default function Profile() {
  const {
    profile,
    loading,
    error,
    deleteEducation,
    deleteExperience,
    deleteProject,
    deleteSkill,
    deleteCertification,
    deleteAwardHonor,
    deleteVolunteer,
    deleteLeadership,
    deletePublication,
    deleteReference,
    updateSummary,
    updateObjective,
    getProfile,
  } = useProfile();
  const { parseResumeFile, isParsingResume, lastParsedResume } = useResume();
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [showAwardHonorForm, setShowAwardHonorForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showLeadershipForm, setShowLeadershipForm] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [showReferenceForm, setShowReferenceForm] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParsedResumeResult | null>(lastParsedResume);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (lastParsedResume) {
      setParseResult(lastParsedResume);
    }
  }, [lastParsedResume]);

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setParseError(null);
    setResumeFile(file ?? null);
  };

  const handleParseResume = async () => {
    if (!resumeFile) {
      setParseError("Please choose a resume file to upload.");
      return;
    }

    const result = await parseResumeFile(resumeFile);
    if (result) {
      setParseResult(result);
      setParseError(null);
      setResumeFile(null);
      try {
        await getProfile();
      } catch (err) {
        console.error("Failed to refresh profile after parsing resume:", err);
      }
    }
  };
  
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
  const [editingCertification, setEditingCertification] = useState<{
    index: number;
    data: {
      name?: string;
      issuer?: string;
      date: string;
      expirationDate?: string;
      credentialId?: string;
      url?: string;
    };
  } | null>(null);
  const [editingAwardHonor, setEditingAwardHonor] = useState<{
    index: number;
    data: {
      title: string;
      issuer?: string;
      date?: string;
      description?: string;
    };
  } | null>(null);
  const [editingVolunteer, setEditingVolunteer] = useState<{
    index: number;
    data: {
      org: string;
      role?: string;
      startDate?: string;
      endDate?: string;
      impact?: string[];
      url?: string;
    };
  } | null>(null);
  const [editingLeadership, setEditingLeadership] = useState<{
    index: number;
    data: {
      org: string;
      position?: string;
      startDate?: string;
      endDate?: string;
      achievements?: string[];
    };
  } | null>(null);
  const [editingPublication, setEditingPublication] = useState<{
    index: number;
    data: {
      title: string;
      venue?: string;
      date?: string;
      url?: string;
      summary?: string;
    };
  } | null>(null);
  const [editingReference, setEditingReference] = useState<{
    index: number;
    data: {
      name: string;
      title?: string;
      company?: string;
      email?: string;
      phone?: string;
      relation?: string;
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

  const handleEditCertification = (index: number) => {
    if (profile?.certifications && profile.certifications[index]) {
      const certification = profile.certifications[index];
      setEditingCertification({
        index,
        data: {
          name: certification.name,
          issuer: certification.issuer,
          date: certification.date,
          expirationDate: certification.expirationDate,
          credentialId: certification.credentialId,
          url: certification.url,
        },
      });
      setShowCertificationForm(true);
    }
  };

  const handleDeleteCertification = async (index: number) => {
    if (confirm("Delete this certification?")) {
      try {
        await deleteCertification(index);
      } catch (error) {
        console.error("Failed to delete certification:", error);
      }
    }
  };

  const handleCloseCertificationForm = () => {
    setShowCertificationForm(false);
    setEditingCertification(null);
  };

  const handleEditAwardHonor = (index: number) => {
    if (profile?.awardsHonors && profile.awardsHonors[index]) {
      const award = profile.awardsHonors[index];
      setEditingAwardHonor({
        index,
        data: {
          title: award.title,
          issuer: award.issuer,
          date: award.date,
          description: award.description,
        },
      });
      setShowAwardHonorForm(true);
    }
  };

  const handleDeleteAwardHonor = async (index: number) => {
    if (confirm("Delete this award or honor?")) {
      try {
        await deleteAwardHonor(index);
      } catch (error) {
        console.error("Failed to delete award/honor:", error);
      }
    }
  };

  const handleCloseAwardHonorForm = () => {
    setShowAwardHonorForm(false);
    setEditingAwardHonor(null);
  };

  const handleEditVolunteer = (index: number) => {
    if (profile?.volunteer && profile.volunteer[index]) {
      const volunteer = profile.volunteer[index];
      setEditingVolunteer({
        index,
        data: {
          org: volunteer.org,
          role: volunteer.role,
          startDate: volunteer.startDate || undefined,
          endDate: volunteer.endDate || undefined,
          impact: volunteer.impact,
          url: volunteer.url,
        },
      });
      setShowVolunteerForm(true);
    }
  };

  const handleDeleteVolunteer = async (index: number) => {
    if (confirm("Delete this volunteer experience?")) {
      try {
        await deleteVolunteer(index);
      } catch (error) {
        console.error("Failed to delete volunteer experience:", error);
      }
    }
  };

  const handleCloseVolunteerForm = () => {
    setShowVolunteerForm(false);
    setEditingVolunteer(null);
  };

  const handleEditLeadership = (index: number) => {
    if (profile?.leadership && profile.leadership[index]) {
      const leadership = profile.leadership[index];
      setEditingLeadership({
        index,
        data: {
          org: leadership.org,
          position: leadership.position,
          startDate: leadership.startDate,
          endDate: leadership.endDate,
          achievements: leadership.achievements,
        },
      });
      setShowLeadershipForm(true);
    }
  };

  const handleDeleteLeadership = async (index: number) => {
    if (confirm("Delete this leadership activity?")) {
      try {
        await deleteLeadership(index);
      } catch (error) {
        console.error("Failed to delete leadership activity:", error);
      }
    }
  };

  const handleCloseLeadershipForm = () => {
    setShowLeadershipForm(false);
    setEditingLeadership(null);
  };

  const handleEditPublication = (index: number) => {
    if (profile?.publications && profile.publications[index]) {
      const publication = profile.publications[index];
      setEditingPublication({
        index,
        data: {
          title: publication.title,
          venue: publication.venue,
          date: publication.date,
          url: publication.url,
          summary: publication.summary,
        },
      });
      setShowPublicationForm(true);
    }
  };

  const handleDeletePublication = async (index: number) => {
    if (confirm("Delete this publication?")) {
      try {
        await deletePublication(index);
      } catch (error) {
        console.error("Failed to delete publication:", error);
      }
    }
  };

  const handleClosePublicationForm = () => {
    setShowPublicationForm(false);
    setEditingPublication(null);
  };

  const handleEditReference = (index: number) => {
    if (profile?.references && profile.references[index]) {
      const reference = profile.references[index];
      setEditingReference({
        index,
        data: {
          name: reference.name,
          title: reference.title,
          company: reference.company,
          email: reference.email,
          phone: reference.phone,
          relation: reference.relation,
        },
      });
      setShowReferenceForm(true);
    }
  };

  const handleDeleteReference = async (index: number) => {
    if (confirm("Delete this reference?")) {
      try {
        await deleteReference(index);
      } catch (error) {
        console.error("Failed to delete reference:", error);
      }
    }
  };

  const handleCloseReferenceForm = () => {
    setShowReferenceForm(false);
    setEditingReference(null);
  };

  const handleClearSummary = async () => {
    if (confirm("Clear your professional summary?")) {
      try {
        await updateSummary(null);
      } catch (error) {
        console.error("Failed to clear summary:", error);
      }
    }
  };

  const handleClearObjective = async () => {
    if (confirm("Clear your career objective?")) {
      try {
        await updateObjective(null);
      } catch (error) {
        console.error("Failed to clear objective:", error);
      }
    }
  };

  const handleCloseSummaryForm = () => {
    setShowSummaryForm(false);
  };

  const handleCloseObjectiveForm = () => {
    setShowObjectiveForm(false);
  };

  if (loading) {
    return <Loading message="Loading profile..." className="flex justify-center items-center h-fit" />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
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
    <div className="min-h-scree">
      {/* Full Width Profile Editor */}
      
      <div className="w-full px-3 sm:px-6 md:px-8 lg:px-12">
        {/* Profile Content */}
        <div className="py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8 bg-white rounded-xl border-[1px] p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Build your professional profile by adding your summary, objectives, experience, education, skills, projects, and additional highlights.
            </p>
          </div>

          {/* Resume Import */}
          <section className="mb-8">
            <div className="bg-white rounded-xl border-[1px] p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Import From Resume</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload your latest resume and we&apos;ll map the details to their matching profile sections automatically.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      handleResumeChange(e);
                      if (e.target) {
                        e.target.value = "";
                      }
                    }}
                    className="w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {resumeFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected file: <span className="font-medium text-gray-800">{resumeFile.name}</span>
                    </p>
                  )}
                  {parseError && <p className="mt-2 text-sm text-red-600">{parseError}</p>}
                </div>

                <div className="flex sm:flex-none">
                  <button
                    onClick={handleParseResume}
                    disabled={!resumeFile || isParsingResume}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isParsingResume ? "Parsing Resume..." : "Parse & Import"}
                  </button>
                </div>
              </div>

              {parseResult && (
                <div className="mt-6 border border-gray-200 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">
                    {parseResult.mapped?.profileUpdated
                      ? "Your profile was updated with new information from the resume."
                      : "Resume parsed successfully. Review the extracted data below."}
                  </p>
                  {parseResult.message && (
                    <p className="mt-1 text-xs text-gray-500">{parseResult.message}</p>
                  )}

                  {parseResult.mapped?.appliedSections?.length ? (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-800">Sections updated:</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {parseResult.mapped.appliedSections.map((section) => (
                          <span
                            key={section}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {parseResult.mapped?.warnings?.length ? (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-amber-700">Warnings:</p>
                      <ul className="mt-2 space-y-1 text-sm text-amber-800 list-disc list-inside">
                        {parseResult.mapped.warnings.map((warning, index) => (
                          <li key={`${warning}-${index}`}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          {/* Summary */}
          <SummarySection
            summary={profile?.summary}
            setShowSummaryForm={setShowSummaryForm}
            handleClearSummary={handleClearSummary}
          />

          {/* Objective */}
          <ObjectiveSection
            objective={profile?.objective}
            setShowObjectiveForm={setShowObjectiveForm}
            handleClearObjective={handleClearObjective}
          />

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

          {/* Certifications */}
          <CertificationSection
            profile={profile}
            setShowCertificationForm={setShowCertificationForm}
            handleEditCertification={handleEditCertification}
            handleDeleteCertification={handleDeleteCertification}
          />

          {/* Awards & Honors */}
          <AwardsHonors
            profile={profile}
            setShowAwardHonorForm={setShowAwardHonorForm}
            handleEditAwardHonor={handleEditAwardHonor}
            handleDeleteAwardHonor={handleDeleteAwardHonor}
          />

          {/* Volunteer */}
          <VolunteerSection
            profile={profile}
            setShowVolunteerForm={setShowVolunteerForm}
            handleEditVolunteer={handleEditVolunteer}
            handleDeleteVolunteer={handleDeleteVolunteer}
          />

          {/* Leadership */}
          <LeadershipSection
            profile={profile}
            setShowLeadershipForm={setShowLeadershipForm}
            handleEditLeadership={handleEditLeadership}
            handleDeleteLeadership={handleDeleteLeadership}
          />

          {/* Publications */}
          <PublicationSection
            profile={profile}
            setShowPublicationForm={setShowPublicationForm}
            handleEditPublication={handleEditPublication}
            handleDeletePublication={handleDeletePublication}
          />

          {/* References */}
          <ReferenceSection
            profile={profile}
            setShowReferenceForm={setShowReferenceForm}
            handleEditReference={handleEditReference}
            handleDeleteReference={handleDeleteReference}
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

      {showCertificationForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <CertificationForm
              onClose={handleCloseCertificationForm}
              initial={editingCertification?.data}
              editIndex={editingCertification?.index ?? null}
            />
          </div>
        </div>
      )}

      {showAwardHonorForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <AwardHonorForm
              onClose={handleCloseAwardHonorForm}
              initial={editingAwardHonor?.data}
              editIndex={editingAwardHonor?.index ?? null}
            />
          </div>
        </div>
      )}

      {showVolunteerForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <VolunteerForm
              onClose={handleCloseVolunteerForm}
              initial={editingVolunteer?.data}
              editIndex={editingVolunteer?.index ?? null}
            />
          </div>
        </div>
      )}

      {showLeadershipForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <LeadershipForm
              onClose={handleCloseLeadershipForm}
              initial={editingLeadership?.data}
              editIndex={editingLeadership?.index ?? null}
            />
          </div>
        </div>
      )}

      {showPublicationForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <PublicationForm
              onClose={handleClosePublicationForm}
              initial={editingPublication?.data}
              editIndex={editingPublication?.index ?? null}
            />
          </div>
        </div>
      )}

      {showReferenceForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <ReferenceForm
              onClose={handleCloseReferenceForm}
              initial={editingReference?.data}
              editIndex={editingReference?.index ?? null}
            />
          </div>
        </div>
      )}

      {showSummaryForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <SummaryForm
              onClose={handleCloseSummaryForm}
              initial={profile?.summary ?? null}
            />
          </div>
        </div>
      )}

      {showObjectiveForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-full flex items-center justify-center min-h-full">
            <ObjectiveForm
              onClose={handleCloseObjectiveForm}
              initial={profile?.objective ?? null}
            />
          </div>
        </div>
      )}
    </div>
  );
}