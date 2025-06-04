import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CapacityData } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateCapacityColor(capacity: number): string {
  if (capacity >= 90) return 'bg-red-500';
  if (capacity >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function getCapacityStatus(data: CapacityData): {
  color: string;
  text: string;
} {
  const usedPercentage = (data.allocatedCapacity / data.totalCapacity) * 100;
  
  if (usedPercentage >= 90) {
    return { color: 'text-red-500', text: 'Overloaded' };
  }
  if (usedPercentage >= 70) {
    return { color: 'text-yellow-500', text: 'High Load' };
  }
  return { color: 'text-green-500', text: 'Available' };
}

export function formatCapacityPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getSkillBadgeColor(skill: string): string {
  const skillColors: Record<string, string> = {
    'React': 'bg-blue-500',
    'Node.js': 'bg-green-500',
    'Python': 'bg-yellow-500',
    'TypeScript': 'bg-blue-600',
    'JavaScript': 'bg-yellow-400',
    'Java': 'bg-red-500',
    'C++': 'bg-purple-500',
    'Go': 'bg-cyan-500',
    'Ruby': 'bg-red-600',
    'PHP': 'bg-indigo-500',
  };
  
  return skillColors[skill] || 'bg-gray-500';
}

export function validateCapacityAllocation(
  currentAllocation: number,
  newAllocation: number,
  maxCapacity: number
): boolean {
  return currentAllocation + newAllocation <= maxCapacity;
} 