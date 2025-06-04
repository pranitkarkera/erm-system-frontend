import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { ChevronLeft } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, fetchProjects } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchProjects();
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchProjects]);

  const project = projects.find((p) => p._id === id);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/projects')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <h2 className="text-2xl font-bold text-red-600">Project not found</h2>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/projects')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{project.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                  <p className="mt-1">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                  <p className="mt-1">{formatDate(project.endDate)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Team Size</h3>
                <p className="mt-1">{project.teamSize} engineers</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Required Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 