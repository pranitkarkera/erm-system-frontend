import React, { useEffect, useMemo } from 'react';
import { useStore } from '../../store';
import { formatDate } from '../../lib/utils';
import { Navigate } from 'react-router-dom';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  managerId: {
    name: string;
    email: string;
  };
}

interface Assignment {
  _id: string;
  engineerId: string;
  projectId: string;
}

export default function MyProjects() {
  const { user, projects, assignments, fetchProjects, fetchAssignments } = useStore();

  useEffect(() => {
    const loadData = async () => {
      if (!user?._id) return;
      await Promise.all([fetchProjects(), fetchAssignments()]);
    };
    loadData();
  }, [fetchProjects, fetchAssignments, user]);

  const myProjects = useMemo(() => {
    if (!user?._id) return [];
    
    // Filter assignments for the current engineer
    const myAssignments = assignments.filter(
      (assignment) => assignment.engineerId === user._id
    );
    
    // Get project IDs from assignments
    const myProjectIds = myAssignments.map(
      (assignment) => assignment.projectId
    );
    
    // Filter projects based on assignments
    return projects.filter((project) => 
      myProjectIds.includes(project._id)
    );
  }, [user, assignments, projects]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'engineer') {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <p className="mt-2 text-gray-600">View your assigned projects</p>
      </div>

      <div className="grid gap-6">
        {myProjects.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">You are not assigned to any projects.</p>
          </div>
        ) : (
          myProjects.map((project: Project) => (
            <div key={project._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'completed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(project.endDate)}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-500 text-sm">Required Skills</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-500 text-sm">Team Size</p>
                <p className="font-medium">{project.teamSize} Engineers</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 