import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/index';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/ui/Button';
import { AssignmentForm } from '../../components/assignments/AssignmentForm';
import { ProjectForm } from '../../components/projects/ProjectForm';
import type { ProjectStatus } from '../../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Projects() {
  const {
    projects,
    engineers,
    capacityData,
    fetchProjects,
    fetchEngineers,
    fetchCapacityData,
    createProject,
    createAssignment,
  } = useStore();
  const navigate = useNavigate();

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | ''>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchProjects(), fetchEngineers()]);
        await fetchCapacityData();
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchProjects, fetchEngineers, fetchCapacityData]);

  // Get unique skills from all projects
  const allSkills = Array.from(
    new Set(projects.flatMap((proj) => proj.requiredSkills))
  );

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => project.requiredSkills.includes(skill));
    return matchesSearch && matchesStatus && matchesSkills;
  });

  const handleAssignEngineer = (projectId: string) => {
    setSelectedProject(projectId);
    setShowAssignmentForm(true);
  };

  const handleCloseAssignmentForm = () => {
    setSelectedProject(null);
    setShowAssignmentForm(false);
  };

  const handleCreateProject = () => {
    setShowProjectForm(true);
  };

  const handleProjectSubmit = async (data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: ProjectStatus;
    requiredSkills: string[];
    teamSize: number;
  }) => {
    try {
      await createProject({
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        status: data.status,
        requiredSkills: data.requiredSkills,
        teamSize: data.teamSize,
      });
      setShowProjectForm(false);
      // Project list will be automatically updated through the store
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button variant="default" onClick={handleCreateProject}>
            Create Project
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full px-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-md"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as ProjectStatus | '')
              }
            >
              <option value="">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <Button
                key={skill}
                variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSkill(skill)}
              >
                {skill}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onAssignEngineer={() => handleAssignEngineer(project._id)}
                onViewDetails={() => handleViewDetails(project._id)}
              />
            ))}
          </div>
        </div>
      </div>

      {showAssignmentForm && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">Assign Engineer</h2>
            <AssignmentForm
              project={projects.find((p) => p._id === selectedProject)}
              engineers={engineers}
              projects={projects}
              capacityData={capacityData}
              onSubmit={async (formData) => {
                try {
                  const assignmentData = {
                    ...formData,
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                  };
                  await createAssignment(assignmentData);
                  handleCloseAssignmentForm();
                  // Refresh data after creating assignment
                  await Promise.all([
                    fetchProjects(),
                    fetchEngineers(),
                    fetchCapacityData(),
                  ]);
                  toast.success('Engineer assigned successfully');
                } catch (error: any) {
                  if (error.response?.data?.message === 'Engineer has overlapping assignments') {
                    toast.error('Engineer has overlapping assignments', {
                      description: 'This engineer already has assignments during the selected time period.',
                      duration: 5000,
                    });
                  } else {
                    toast.error('Failed to assign engineer', {
                      description: error.response?.data?.message || 'An error occurred while assigning the engineer',
                    });
                  }
                  console.error('Failed to create assignment:', error);
                }
              }}
              onCancel={handleCloseAssignmentForm}
            />
          </div>
        </div>
      )}

      {showProjectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
            <ProjectForm
              onSubmit={handleProjectSubmit}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 