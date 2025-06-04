import { useEffect, useState } from "react";
import { useStore } from "../store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AssignmentForm } from "../components/assignments/AssignmentForm";
import { formatDate, formatCapacityPercentage } from "../lib/utils";
import { Skeleton } from "../components/ui/Skeleton";
import { Assignment, User, Project } from "../types";

interface PopulatedAssignment extends Omit<Assignment, 'engineerId' | 'projectId'> {
  engineerId: string | User;
  projectId: string | Project;
}

export default function Assignments() {
  const {
    assignments = [],
    engineers = [],
    projects = [],
    capacityData = {},
    fetchAssignments,
    fetchEngineers,
    fetchProjects,
    fetchCapacityData,
    deleteAssignment,
    createAssignment,
  } = useStore();

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchAssignments(),
          fetchEngineers(),
          fetchProjects(),
          fetchCapacityData(),
        ]);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchAssignments, fetchEngineers, fetchProjects, fetchCapacityData]);

  const filteredAssignments = (assignments as PopulatedAssignment[]).filter((assignment) => {
    const engineerName = typeof assignment.engineerId === 'object' 
      ? assignment.engineerId.name 
      : engineers.find((e) => e._id === assignment.engineerId)?.name || '';

    const projectName = typeof assignment.projectId === 'object'
      ? assignment.projectId.name
      : projects.find((p) => p._id === assignment.projectId)?.name || '';

    const matchesSearch = (
      engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesEngineer = !selectedEngineer || 
      (typeof assignment.engineerId === 'object' ? assignment.engineerId._id : assignment.engineerId) === selectedEngineer;
    
    const matchesProject = !selectedProject || 
      (typeof assignment.projectId === 'object' ? assignment.projectId._id : assignment.projectId) === selectedProject;

    return matchesSearch && matchesEngineer && matchesProject;
  });

  const handleEngineerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Selected engineer:', e.target.value);
    setSelectedEngineer(e.target.value);
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Selected project:', e.target.value);
    setSelectedProject(e.target.value);
  };

  // Log the data we're working with
  useEffect(() => {
    console.log('Current state:', {
      assignments,
      engineers,
      projects,
      selectedEngineer,
      selectedProject,
      filteredAssignments
    });
  }, [assignments, engineers, projects, selectedEngineer, selectedProject, filteredAssignments]);

  const handleCloseAssignmentForm = () => {
    setShowAssignmentForm(false);
  };

  const handleCreateAssignment = async (data: any) => {
    try {
      await createAssignment(data);
      handleCloseAssignmentForm();
      // Refresh data after creating assignment
      await Promise.all([fetchAssignments(), fetchCapacityData()]);
    } catch (error) {
      console.error("Failed to create assignment:", error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      await deleteAssignment(assignmentId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assignments</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <Button onClick={() => setShowAssignmentForm(true)}>
            Create Assignment
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search assignments..."
                className="w-full px-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-md"
              value={selectedEngineer}
              onChange={handleEngineerChange}
            >
              <option value="">All Engineers</option>
              {engineers.map((engineer) => (
                <option key={engineer._id} value={engineer._id}>
                  {engineer.name}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2 border rounded-md"
              value={selectedProject}
              onChange={handleProjectChange}
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssignments.map((assignment) => {
              const engineerName = typeof assignment.engineerId === 'object' 
                ? assignment.engineerId.name 
                : engineers.find((e) => e._id === assignment.engineerId)?.name || 'Unknown Engineer';

              const projectName = typeof assignment.projectId === 'object'
                ? assignment.projectId.name
                : projects.find((p) => p._id === assignment.projectId)?.name || 'Unknown Project';

              return (
                <Card key={assignment._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{engineerName}</CardTitle>
                        <div className="text-sm text-gray-500">{projectName}</div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAssignment(assignment._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm font-medium">Role</div>
                        <div className="text-gray-600">{assignment.role}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Allocation</div>
                        <div className="text-gray-600">{assignment.allocationPercentage}%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Duration</div>
                        <div className="text-gray-600">
                          {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {showAssignmentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">Create Assignment</h2>
            <AssignmentForm
              engineers={engineers}
              projects={projects}
              capacityData={capacityData}
              onSubmit={handleCreateAssignment}
              onCancel={handleCloseAssignmentForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
