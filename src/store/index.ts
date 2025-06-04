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
      set({ projects: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error("Fetch projects failed:", err);
      set({ projects: [] });
    }
  },

  fetchAssignments: async () => {
    try {
      const response = await axios.get(`/assignments`);
      const assignments = response.data.map((assignment: any) => ({
        ...assignment,
        engineerId: assignment.engineerId,
        projectId: assignment.projectId,
        engineerName: typeof assignment.engineerId === 'object' ? assignment.engineerId.name : "Unknown Engineer",
        projectName: typeof assignment.projectId === 'object' ? assignment.projectId.name : "Unknown Project",
      }));
      set({ assignments });
    } catch (err) {
      console.error("Fetch assignments failed:", err);
      set({ assignments: [] });
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
    const engineerAssignments = state.assignments.filter(
      (assignment) => assignment.engineerId === engineerId
    );
    const projectIds = engineerAssignments.map((assignment) => assignment.projectId);
    return state.projects.filter((project) => projectIds.includes(project._id));
  },
}));  