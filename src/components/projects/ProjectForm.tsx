import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Label } from '../ui/Label';
import type { ProjectStatus } from '@/types';

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  requiredSkills: string[];
  teamSize: number;
}

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      requiredSkills: [],
      teamSize: 1,
    },
  });

  const [skillInput, setSkillInput] = useState('');
  const requiredSkills = watch('requiredSkills');

  const addSkills = (skillsToAdd: string[]) => {
    const currentSkills = requiredSkills || [];
    const newUniqueSkills = skillsToAdd
      .map(skill => skill.trim())
      .filter(skill => 
        skill.length > 0 && !currentSkills.includes(skill.toLowerCase())
      )
      .map(skill => skill.toLowerCase());

    if (newUniqueSkills.length > 0) {
      setValue('requiredSkills', [...currentSkills, ...newUniqueSkills]);
    }
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillInput.trim()) {
        addSkills([skillInput]);
        setSkillInput('');
      }
    }
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);
    
    if (value.includes(',')) {
      const skills = value.split(',').filter(skill => skill.trim().length > 0);
      if (skills.length > 0) {
        addSkills(skills);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue(
      'requiredSkills',
      (requiredSkills || []).filter((skill) => skill !== skillToRemove)
    );
  };

  const handleFormSubmit = (data: ProjectFormData) => {
    // Ensure requiredSkills is included in the submission
    const formData = {
      ...data,
      requiredSkills: requiredSkills || [],
    };
    return onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('name', { required: 'Project name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              {...register('description', {
                required: 'Project description is required',
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <input
                id="startDate"
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                {...register('startDate', { required: 'Start date is required' })}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <input
                id="endDate"
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                {...register('endDate', { required: 'End date is required' })}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border rounded-md"
                {...register('status', { required: 'Status is required' })}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <input
                id="teamSize"
                type="number"
                min={1}
                className="w-full px-3 py-2 border rounded-md"
                {...register('teamSize', {
                  required: 'Team size is required',
                  min: { value: 1, message: 'Team size must be at least 1' },
                  valueAsNumber: true,
                })}
              />
              {errors.teamSize && (
                <p className="mt-1 text-sm text-red-600">{errors.teamSize.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="skills">Required Skills</Label>
            <input
              id="skills"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Type skill and press Enter (or use commas)"
              value={skillInput}
              onChange={handleSkillInputChange}
              onKeyDown={handleSkillAdd}
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter skills separated by commas or press Enter after each skill
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(requiredSkills || []).map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => removeSkill(skill)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 