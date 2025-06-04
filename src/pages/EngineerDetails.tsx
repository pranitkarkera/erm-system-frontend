import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { formatCapacityPercentage, getSkillBadgeColor } from '../lib/utils';

export default function EngineerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { engineers, capacityData, fetchEngineers, fetchCapacityData } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchEngineers(), fetchCapacityData()]);
      } catch (error) {
        console.error('Failed to load engineer:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchEngineers, fetchCapacityData]);

  const engineer = engineers.find((e) => e._id === id);
  const engineerCapacity = capacityData[id || ''] || {
    engineerId: id,
    allocatedCapacity: 0,
    totalCapacity: 100,
    availableCapacity: 100,
  };

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

  if (!engineer) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/engineers')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Engineers
        </Button>
        <h2 className="text-2xl font-bold text-red-600">Engineer not found</h2>
      </div>
    );
  }

  const allocationPercentage = (engineerCapacity.allocatedCapacity / engineerCapacity.totalCapacity) * 100;
  const availablePercentage = 100 - allocationPercentage;

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/engineers')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Engineers
      </Button>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{engineer.name}</h1>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {engineer.seniority} Engineer
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engineer Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1">{engineer.department}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
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
                <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                <div className="mt-2 space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(allocationPercentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      Allocated: {formatCapacityPercentage(allocationPercentage)}
                    </span>
                    <span>
                      Available: {formatCapacityPercentage(availablePercentage)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* We can add more sections here like Current Assignments, Work History, etc. */}
      </div>
    </div>
  );
} 