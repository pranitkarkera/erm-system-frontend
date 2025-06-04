import { create } from 'zustand';
import axios from 'axios';
import type { User, Project, Assignment } from './types';

export interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  engineers: User[];
  projects: Project[];
  assignments: Assignment[];
  capacityData: Record<string, { allocatedCapacity: number; totalCapacity: number }>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (user: User) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  fetchEngineers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchCapacityData: () => Promise<void>;
  createProject: (project: Omit<Project, '_id'>) => Promise<void>;
  createAssignment: (assignment: Omit<Assignment, '_id'>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

export const useStore = create<StoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  engineers: [],
  projects: [],
  assignments: [],
  capacityData: {},

  login: async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Save token
      localStorage.setItem('token', token);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  updateUser: async (updatedUser) => {
    try {
      const response = await axios.put(`/api/users/${updatedUser._id}`, updatedUser);
      set({ user: response.data });
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  fetchCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, isAuthenticated: false });
        return;
      }

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await axios.get('/api/users/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchEngineers: async () => {
    try {
      const response = await axios.get('/api/engineers');
      set({ engineers: response.data });
    } catch (error) {
      console.error('Failed to fetch engineers:', error);
      throw error;
    }
  },

  fetchProjects: async () => {
    try {
      const response = await axios.get('/api/projects');
      set({ projects: response.data });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  },

  fetchAssignments: async () => {
    try {
      const response = await axios.get('/api/assignments');
      // Store the populated assignments
      set((state) => ({
        assignments: response.data.map((assignment: any) => ({
          ...assignment,
          engineerId: assignment.engineerId._id || assignment.engineerId,
          projectId: assignment.projectId._id || assignment.projectId,
          engineerName: assignment.engineerId.name,
          projectName: assignment.projectId.name
        }))
      }));
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      throw error;
    }
  },

  fetchCapacityData: async () => {
    try {
      const response = await axios.get('/api/users/capacity/all');
      set({ capacityData: response.data });
    } catch (error) {
      console.error('Failed to fetch capacity data:', error);
      throw error;
    }
  },

  createProject: async (project) => {
    try {
      const response = await axios.post('/api/projects', project);
      set((state) => ({
        projects: [...state.projects, response.data]
      }));
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  },

  createAssignment: async (assignment) => {
    try {
      const response = await axios.post('/api/assignments', assignment);
      set((state) => ({
        assignments: [...state.assignments, response.data]
      }));
      // Refresh capacity data immediately after creating assignment
      await set.getState().fetchCapacityData();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      throw error;
    }
  },

  deleteAssignment: async (id) => {
    try {
      await axios.delete(`/api/assignments/${id}`);
      set((state) => ({
        assignments: state.assignments.filter(assignment => assignment._id !== id)
      }));
      // Refresh capacity data immediately after deleting assignment
      await set.getState().fetchCapacityData();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      throw error;
    }
  },
})); 