import { Plus } from "lucide-react";
import ProjectCard from "../Cards/ProjectCard";

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate?: string | null;
}

interface Profile {
  projects?: Project[];
}

interface ProjectProps {
  profile: Profile | null;
  setShowProjectForm: (show: boolean) => void;
  handleEditProject: (index: number) => void;
  handleDeleteProject: (index: number) => void;
}

export default function Project({ profile, setShowProjectForm, handleEditProject, handleDeleteProject }: ProjectProps) {
  return (
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
            profile.projects.map((project: Project, idx: number) => (
              <ProjectCard
                key={idx}
                name={project.name}
                description={project.description}
                technologies={project.technologies || []}
                url={project.url}
                startDate={project.startDate}
                endDate={project.endDate}
                onEdit={() => handleEditProject(idx)}
                onDelete={() => handleDeleteProject(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No projects added yet</p>
              <button
                onClick={() => setShowProjectForm(true)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Add your first project →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}