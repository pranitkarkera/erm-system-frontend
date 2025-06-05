import { useEffect, useState } from 'react';
import { useStore } from '../../store/index';
import { CapacityChart } from '../../components/dashboard/CapacityChart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { formatCapacityPercentage, formatDate } from '../../lib/utils';
import type { Project, Assignment, User } from '@/types';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Dashboard() {
  const {
    user,
    engineers,
    projects,
    assignments,
    capacityData,
    fetchEngineers,
    fetchProjects,
    fetchAssignments,
    fetchCapacityData,
  } = useStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchEngineers(),
          fetchProjects(),
          fetchAssignments(),
          fetchCapacityData(),
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchEngineers, fetchProjects, fetchAssignments, fetchCapacityData]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const totalEngineers = engineers.length;
  const totalAssignments = assignments.length;

  const averageTeamCapacity =
    engineers && engineers.length > 0
      ? engineers.reduce((sum, eng) => {
          const capacity = capacityData?.[eng._id];
          if (!capacity || typeof capacity.allocatedCapacity !== 'number' || typeof capacity.totalCapacity !== 'number') {
            return sum;
          }
          // Calculate available capacity (total - allocated)
          const availableCapacity = capacity.totalCapacity - capacity.allocatedCapacity;
          return sum + availableCapacity;
        }, 0) / engineers.filter(eng => {
          const capacity = capacityData?.[eng._id];
          return capacity && typeof capacity.allocatedCapacity === 'number' && typeof capacity.totalCapacity === 'number';
        }).length || 1
      : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name || 'User'}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Projects
            </CardTitle>
          </CardHeader> 
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Engineers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngineers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Average Team Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCapacityPercentage(averageTeamCapacity)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Available capacity average
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Team Capacity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <CapacityChart
            engineers={engineers}
            capacityData={capacityData}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects
                .slice(0, 5)
                .map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-gray-500">
                        {project.requiredSkills.join(', ')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'planning'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                ))}
              {projects.length === 0 && (
                <div className="text-center text-gray-500">No projects found</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments
                .slice(0, 5)
                .map((assignment) => {
                  // Get engineer name
                  const engineerName = typeof assignment.engineerId === 'object' && assignment.engineerId
                    ? assignment.engineerId.name
                    : engineers.find(e => e._id === assignment.engineerId)?.name || 'Unknown Engineer';

                  // Get project name
                  const projectName = typeof assignment.projectId === 'object' && assignment.projectId
                    ? assignment.projectId.name
                    : projects.find(p => p._id === assignment.projectId)?.name || 'Unknown Project';

                  return (
                    <div
                      key={assignment._id}
                      className="flex items-center justify-between p-4 border rounded"
                    >
                      <div>
                        <h3 className="font-medium">
                          {engineerName} → {projectName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Allocation: {formatCapacityPercentage(assignment.allocationPercentage)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(assignment.startDate)}
                      </div>
                    </div>
                  );
                })}
              {assignments.length === 0 && (
                <div className="text-center text-gray-500">No assignments found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 