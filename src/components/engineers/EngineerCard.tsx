import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/Card';
import { Button } from '../ui/Button';
import { User, CapacityData } from '../../types';
import {
  getCapacityStatus,
  formatCapacityPercentage,
  getSkillBadgeColor,
} from '../../lib/utils';

interface EngineerCardProps {
  engineer: User;
  capacityData: CapacityData;
  onAssign?: () => void;
  onViewDetails?: () => void;
}

export function EngineerCard({
  engineer,
  capacityData,
  onAssign,
  onViewDetails,
}: EngineerCardProps) {
  const { color, text } = getCapacityStatus(capacityData);
  const allocatedCapacity = capacityData.allocatedCapacity || 0;
  const totalCapacity = capacityData.totalCapacity || engineer.maxCapacity || 100;
  const availableCapacity = totalCapacity - allocatedCapacity;
  const isPartTime = totalCapacity < 100;
  
  // Calculate absolute percentages (out of 100%)
  const absoluteAllocatedPercentage = allocatedCapacity; // This is already in percentage
  const absoluteAvailablePercentage = availableCapacity;
  // const maxCapacityText = isPartTime ? ` (${totalCapacity}% Part-time)` : '';

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{engineer.name}</span>
          <span className={`text-sm font-normal ${color}`}>{text}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Skills</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {engineer.skills?.map((skill) => (
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
        <div>
          <p className="text-sm font-medium text-gray-500">Capacity</p>
          <div className="mt-2 space-y-2">
            <div className="relative w-full bg-gray-200 rounded-full h-2.5">
              {isPartTime && (
                <div
                  className="absolute top-0 bottom-0 right-0 bg-gray-300 rounded-r-full"
                  style={{
                    width: `${100 - totalCapacity}%`,
                  }}
                />
              )}
              <div
                className="h-2.5 rounded-full bg-blue-600"
                style={{
                  width: `${absoluteAllocatedPercentage}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Allocated: {formatCapacityPercentage(absoluteAllocatedPercentage)}
              </span>
              <span>
                Available: {formatCapacityPercentage(absoluteAvailablePercentage)}
              </span>
            </div>
            {/* {isPartTime && (
              <div className="text-xs text-gray-500 text-center">
                Maximum Capacity: {formatCapacityPercentage(totalCapacity)}
              </div>
            )} */}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Department</p>
          <p className="mt-1 text-sm">{engineer.department}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Seniority</p>
          <p className="mt-1 text-sm capitalize">{engineer.seniority}</p>
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
        {onAssign && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={onAssign}
            disabled={availableCapacity <= 0}
          >
            Assign to Project
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 