import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Project } from '../../types';
import { formatDate, getSkillBadgeColor } from '../../lib/utils';

interface ProjectCardProps {
  project: Project;
  onAssignEngineer?: () => void;
  onViewDetails?: () => void;
}

export function ProjectCard({
  project,
  onAssignEngineer,
  onViewDetails,
}: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'planning':
        return 'text-blue-500';
      case 'completed':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{project.name}</CardTitle>
          <span
            className={`text-sm font-medium capitalize ${getStatusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
        </div>
        <CardDescription className="mt-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Required Skills</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {project.requiredSkills.map((skill) => (
              <span
                key={skill}
                className={`px-2 py-1 text-xs text-white rounded-full ${getSkillBadgeColor(
                  skill
                )}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Start Date</p>
            <p className="mt-1 text-sm">
              {formatDate(project.startDate)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">End Date</p>
            <p className="mt-1 text-sm">
              {formatDate(project.endDate)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Team Size</p>
          <p className="mt-1 text-sm">{project.teamSize} engineers</p>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onViewDetails}
        >
          View Details
        </Button>
        {onAssignEngineer && project.status !== 'completed' && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={onAssignEngineer}
          >
            Assign Engineer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 