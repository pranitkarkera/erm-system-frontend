import axios from "axios";
import { create } from "zustand";
import { API_URL } from "../config";
import type { User, Project, Assignment, UserRole, SeniorityLevel } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface CapacityData {
  allocatedCapacity: number;
  totalCapacity: number;
  engineerId: string;
  availableCapacity: number;
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
  fetchCurrentUser: () => Promise<void>;

  // Resource fetch actions
  fetchProjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchEngineers: () => Promise<void>;
  fetchCapacityData: () => Promise<void>;

  // Assignment CRUD
  createAssignment: (assignment: Omit<Assignment, "_id">) => Promise<void>;
  updateAssignment: (
    id: string,
    assignment: Partial<Assignment>
  ) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  // Project CRUD
  createProject: (project: Omit<Project, "_id">) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;

  getEngineerProjects: (engineerId: string) => Project[];
}

export const useStore = create<Store>((set, get) => ({
  // Auth State
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,

  // Resource State
  projects: [],
  assignments: [],
  engineers: [],
  capacityData: {},

  // Auth Methods
  login: async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      set({ token, user, isAuthenticated: true });
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  signUp: async (
    name,
    email,
    password,
    role,
    skills,
    department,
    seniority,
    maxCapacity
  ) => {
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

      const res = await axios.post(`${API_URL}/auth/signup`, payload);
      return res.data;
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    }
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      set({ user: res.data.data, isAuthenticated: true });
    } catch (err) {
      console.error("Fetch user failed:", err);
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  // Resource Fetch
  fetchProjects: async () => {
    try {
      console.log('Fetching projects...');
      const res = await axios.get(`${API_URL}/projects`);
      console.log('Projects response:', res.data);
      set({ projects: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error("Fetch projects failed:", err);
      set({ projects: [] });
    }
  },

  fetchAssignments: async () => {
    try {
      console.log('Fetching assignments...');
      const response = await axios.get(`${API_URL}/assignments`, {
        headers: { Authorization: `Bearer ${get().token}` },
      });
      console.log('Raw assignments response:', response.data);

      // Ensure we're getting the populated data and handling IDs correctly
      const assignments = response.data.map((assignment: any) => ({
        ...assignment,
        engineerId: assignment.engineerId?._id || assignment.engineerId,
        projectId: assignment.projectId?._id || assignment.projectId,
        engineerName: assignment.engineerId?.name || "Unknown Engineer",
        projectName: assignment.projectId?.name || "Unknown Project",
      }));

      console.log('Processed assignments:', assignments);
      set({ assignments });
    } catch (err) {
      console.error("Fetch assignments failed:", err);
      set({ assignments: [] });
    }
  },

  fetchEngineers: async () => {
    try {
      console.log('Fetching engineers...');
      const res = await axios.get(`${API_URL}/engineers`);
      console.log('Engineers response:', res.data);
      set({ engineers: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error("Fetch engineers failed:", err);
      set({ engineers: [] });
    }
  },

  fetchCapacityData: async () => {
    try {
      const engineers = get().engineers || [];
      const data: Record<string, CapacityData> = {};

      for (const engineer of engineers) {
        const res = await axios.get(
          `${API_URL}/engineers/${engineer._id}/capacity`,
          {
            headers: { Authorization: `Bearer ${get().token}` },
          }
        );
        // Ensure the backend returns the expected structure
        const cap = res.data;
        data[engineer._id] = {
          engineerId: engineer._id,
          allocatedCapacity: typeof cap.allocatedCapacity === "number" ? cap.allocatedCapacity : 0,
          totalCapacity: typeof cap.maxCapacity === "number" ? cap.maxCapacity : 100,
          availableCapacity: typeof cap.availableCapacity === "number" ? cap.availableCapacity : 100,
        };
      }

      set({ capacityData: data });
    } catch (err) {
      console.error("Fetch capacity data failed:", err);
      set({ capacityData: {} });
    }
  },

  // Project Actions
  createProject: async (project) => {
    try {
      await axios.post(`${API_URL}/projects`, project);
      await get().fetchProjects();
    } catch (err) {
      console.error("Create project failed:", err);
      throw err;
    }
  },

  updateProject: async (id, project) => {
    try {
      await axios.put(`${API_URL}/projects/${id}`, project);
      await get().fetchProjects();
    } catch (err) {
      console.error("Update project failed:", err);
      throw err;
    }
  },

  // Assignment Actions
  createAssignment: async (assignment) => {
    try {
      const response = await axios.post(`${API_URL}/assignments`, assignment, {
        headers: { Authorization: `Bearer ${get().token}` },
      });
      await Promise.all([get().fetchAssignments(), get().fetchCapacityData()]);
    } catch (err) {
      console.error("Create assignment failed:", err);
      throw err;
    }
  },

  updateAssignment: async (id, assignment) => {
    try {
      const response = await axios.put(`${API_URL}/assignments/${id}`, assignment, {
        headers: { Authorization: `Bearer ${get().token}` },
      });
      await Promise.all([get().fetchAssignments(), get().fetchCapacityData()]);
    } catch (err) {
      console.error("Update assignment failed:", err);
      throw err;
    }
  },

  deleteAssignment: async (id) => {
    try {
      await axios.delete(`${API_URL}/assignments/${id}`, {
        headers: { Authorization: `Bearer ${get().token}` },
      });
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