import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import type { User, Project } from '@/types';
import { validateCapacityAllocation } from '../../lib/utils';

interface AssignmentFormProps {
  engineer?: User;
  project?: Project;
  engineers: User[];
  projects: Project[];
  capacityData: Record<string, { allocatedCapacity: number; totalCapacity: number }>;
  onSubmit: (data: AssignmentFormData) => void;
  onCancel: () => void;
}

const assignmentSchema = z.object({
  engineerId: z.string().min(1, 'Engineer is required'),
  projectId: z.string().min(1, 'Project is required'),
  allocationPercentage: z.number()
    .min(1, 'Allocation must be at least 1%')
    .max(100, 'Allocation cannot exceed 100%'),
  startDate: z.string()
    .min(1, 'Start date is required')
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: 'Invalid start date',
    }),
  endDate: z.string()
    .min(1, 'End date is required')
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: 'Invalid end date',
    }),
  role: z.string().min(1, 'Role is required'),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

export function AssignmentForm({
  engineer,
  project,
  engineers,
  projects,
  capacityData,
  onSubmit,
  onCancel,
}: AssignmentFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      engineerId: engineer?._id || '',
      projectId: project?._id || '',
      allocationPercentage: 0,
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      role: '',
    },
  });

  const selectedEngineerId = watch('engineerId');
  const selectedProjectId = watch('projectId');
  const allocationPercentage = watch('allocationPercentage');

  const selectedEngineerCapacity = selectedEngineerId
    ? capacityData[selectedEngineerId]
    : null;

  const isValidAllocation =
    selectedEngineerCapacity &&
    validateCapacityAllocation(
      selectedEngineerCapacity.allocatedCapacity,
      allocationPercentage,
      selectedEngineerCapacity.totalCapacity
    );

  // Auto-fill project dates when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const selectedProject = projects.find(p => p._id === selectedProjectId);
      if (selectedProject) {
        // Convert project dates to YYYY-MM-DD format
        const startDate = new Date(selectedProject.startDate).toISOString().split('T')[0];
        const endDate = new Date(selectedProject.endDate).toISOString().split('T')[0];
        
        setValue('startDate', startDate);
        setValue('endDate', endDate);
      }
    }
  }, [selectedProjectId, projects, setValue]);

  const onFormSubmit = handleSubmit(async (data) => {
    try {
      if (!isValidAllocation) {
        alert('Invalid allocation percentage. Please check engineer capacity.');
        return;
      }

      // Get the selected project's dates
      const selectedProject = projects.find(p => p._id === data.projectId);
      if (!selectedProject) {
        alert('Please select a valid project');
        return;
      }

      // Format the data
      const formattedData = {
        ...data,
        allocationPercentage: Number(data.allocationPercentage),
        startDate: new Date(selectedProject.startDate).toISOString(),
        endDate: new Date(selectedProject.endDate).toISOString(),
      };

      await onSubmit(formattedData);
    } catch (error: any) {
      console.error('Assignment submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create assignment. Please check all fields and try again.';
      alert(errorMessage);
    }
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Engineer
          </label>
          <select
            {...register('engineerId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={!!engineer}
          >
            <option value="">Select Engineer</option>
            {engineers.map((eng) => (
              <option key={eng._id} value={eng._id}>
                {eng.name}
              </option>
            ))}
          </select>
          {errors.engineerId?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.engineerId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <select
            {...register('projectId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={!!project}
          >
            <option value="">Select Project</option>
            {projects
              .filter((p) => p.status !== 'completed')
              .map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name}
                </option>
              ))}
          </select>
          {errors.projectId?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.projectId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            {...register('startDate')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled
          />
          {errors.startDate?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            {...register('endDate')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled
          />
          {errors.endDate?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.endDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Allocation Percentage
          </label>
          <input
            type="number"
            {...register('allocationPercentage', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min={1}
            max={100}
          />
          {errors.allocationPercentage?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.allocationPercentage.message}
            </p>
          )}
          {selectedEngineerCapacity && !isValidAllocation && (
            <p className="mt-1 text-sm text-red-600">
              This allocation exceeds engineer's available capacity
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <input
            type="text"
            {...register('role')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g., Developer, Tech Lead"
          />
          {errors.role?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.role.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !isValidAllocation}>
          {isSubmitting ? 'Assigning...' : project ? 'Assign Engineer' : 'Assign to Project'}
        </Button>
      </div>
    </form>
  );
} 