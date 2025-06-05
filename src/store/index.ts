import axios from "../utils/axios";
import { create } from "zustand";
import { API_URL } from "../config";
import type { User, Project, Assignment, UserRole, SeniorityLevel, CapacityData } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface Store extends AuthState {
  projects: Project[];
  assignments: Assignment[];
  engineers: User[];
  capacityData: Record<string, CapacityData>;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    skills: string[],
    department: string,
    seniority: SeniorityLevel,
    maxCapacity: number
  ) => Promise<void>;

  // Resource actions
  fetchProjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchEngineers: () => Promise<void>;
  fetchCapacityData: () => Promise<void>;
  createProject: (project: Omit<Project, "_id">) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  createAssignment: (assignment: Omit<Assignment, "_id">) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  getEngineerProjects: (engineerId: string) => Project[];
}

export const useStore = create<Store>((set, get) => ({
  // Auth State
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  // Resource State
  projects: [],
  assignments: [],
  engineers: [],
  capacityData: {},

  // Auth Methods
  login: async (email, password) => {
    try {
      const res = await axios.post(`/auth/login`, { email, password });
      const { token, user } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      
      set({ 
        token, 
        user, 
        isAuthenticated: true 
      });
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      projects: [],
      assignments: [],
      engineers: [],
      capacityData: {}
    });
  },

  signUp: async (name, email, password, role, skills, department, seniority, maxCapacity) => {
    try {
      const cleanedSkills = (Array.isArray(skills) ? skills : []).filter(
        (skill) => typeof skill === "string" && skill.trim().length > 0
      );

      const payload = {
        name,
        email,
        password,
        role,
        skills: cleanedSkills,
        department,
        seniority,
        maxCapacity,
      };

      const res = await axios.post(`/auth/signup`, payload);
      return res.data;
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    }
  },

  // Resource Methods
  fetchProjects: async () => {
    try {
      const res = await axios.get(`/projects`);
      console.log('Raw projects from API:', res.data);
      const projects = Array.isArray(res.data) ? res.data : [];
      set({ projects });
      return projects;
    } catch (err) {
      console.error("Fetch projects failed:", err);
      set({ projects: [] });
      return [];
    }
  },

  fetchAssignments: async () => {
    try {
      const response = await axios.get(`/assignments`);
      console.log('Raw assignments from API:', response.data);
      const assignments = Array.isArray(response.data) ? response.data : [];
      set({ assignments });
      return assignments;
    } catch (err) {
      console.error("Fetch assignments failed:", err);
      set({ assignments: [] });
      return [];
    }
  },

  fetchEngineers: async () => {
    try {
      const res = await axios.get(`/engineers`);
      set({ engineers: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error("Fetch engineers failed:", err);
      set({ engineers: [] });
    }
  },

  fetchCapacityData: async () => {
    try {
      const res = await axios.get('/engineers/capacity/all');
      set({ capacityData: res.data });
    } catch (err) {
      console.error("Fetch capacity data failed:", err);
      set({ capacityData: {} });
    }
  },

  createProject: async (project) => {
    try {
      await axios.post(`/projects`, project);
      await get().fetchProjects();
    } catch (err) {
      console.error("Create project failed:", err);
      throw err;
    }
  },

  updateProject: async (id, project) => {
    try {
      await axios.put(`/projects/${id}`, project);
      await get().fetchProjects();
    } catch (err) {
      console.error("Update project failed:", err);
      throw err;
    }
  },

  createAssignment: async (assignment) => {
    try {
      await axios.post(`/assignments`, assignment);
      await Promise.all([get().fetchAssignments(), get().fetchCapacityData()]);
    } catch (err) {
      console.error("Create assignment failed:", err);
      throw err;
    }
  },

  updateAssignment: async (id, assignment) => {
    try {
      await axios.put(`/assignments/${id}`, assignment);
      await Promise.all([get().fetchAssignments(), get().fetchCapacityData()]);
    } catch (err) {
      console.error("Update assignment failed:", err);
      throw err;
    }
  },

  deleteAssignment: async (id) => {
    try {
      await axios.delete(`/assignments/${id}`);
      await Promise.all([get().fetchAssignments(), get().fetchCapacityData()]);
    } catch (err) {
      console.error("Delete assignment failed:", err);
      throw err;
    }
  },

  getEngineerProjects: (engineerId: string) => {
    const state = get();
    console.log('Looking for projects for engineer:', engineerId);
    console.log('Available assignments:', state.assignments);
    console.log('Available projects:', state.projects);

    // Find assignments for this engineer
    const engineerAssignments = state.assignments.filter(assignment => {
      const assignmentEngineerId = assignment.engineerId?._id || assignment.engineerId;
      console.log('Comparing engineer IDs:', { 
        assignmentEngineerId, 
        engineerId, 
        match: assignmentEngineerId === engineerId 
      });
      return assignmentEngineerId === engineerId;
    });
    
    console.log('Found engineer assignments:', engineerAssignments);

    // Get project IDs from assignments
    const projectIds = engineerAssignments.map(assignment => 
      assignment.projectId?._id || assignment.projectId
    );
    
    console.log('Project IDs to look for:', projectIds);

    // Find the actual projects
    const engineerProjects = state.projects.filter(project => 
      projectIds.includes(project._id)
    );

    console.log('Final projects found:', engineerProjects);
    return engineerProjects;
  },
}));  