import React, { useEffect, useMemo } from "react";
import { useStore } from "../store";
import { formatDate } from "../lib/utils";
import { Navigate } from "react-router-dom";

interface Project {
  _id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "pending";
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  managerId: {
    name: string;
    email: string;
  };
}

interface User {
  _id: string;
  role: string;
}

interface StoreInterface {
  user: User | null;
  fetchProjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  getEngineerProjects: (engineerId: string) => Project[];
}

export default function MyProjects() {
  const { user, fetchProjects, fetchAssignments, getEngineerProjects } =
    useStore() as StoreInterface;

  useEffect(() => {
    const loadData = async () => {
      if (!user?._id) return;
      await Promise.all([fetchProjects(), fetchAssignments()]);
    };
    loadData();
  }, [fetchProjects, fetchAssignments, user]);

  const myProjects = useMemo(() => {
    if (!user?._id) return [];
    return getEngineerProjects(user._id);
  }, [user, getEngineerProjects]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "engineer") {
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
            <p className="text-gray-600">
              You are not assigned to any projects.
            </p>
          </div>
        ) : (
          myProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {project.description}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === "active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "completed"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
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
