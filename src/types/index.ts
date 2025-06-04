export type UserRole = 'engineer' | 'manager';
export type ProjectStatus = 'planning' | 'active' | 'completed';
export type SeniorityLevel = 'junior' | 'mid' | 'senior';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  skills?: string[];
  seniority?: SeniorityLevel;
  maxCapacity?: number;
  department?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  requiredSkills: string[];
  teamSize: number;
  status: ProjectStatus;
  managerId: string;
}

export interface Assignment {
  _id: string;
  engineerId: string;
  projectId: string;
  engineerName?: string;
  projectName?: string;
  allocationPercentage: number;
  startDate: Date;
  endDate: Date;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CapacityData {
  engineerId: string;
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export type { User as default }; 