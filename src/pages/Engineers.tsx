import { useEffect, useState } from "react";
import { useStore } from "../store";
import { EngineerCard } from "../components/engineers/EngineerCard";
import { Button } from "../components/ui/Button";
import { AssignmentForm } from "../components/assignments/AssignmentForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Engineers() {
  const {
    engineers,
    projects,
    capacityData,
    fetchEngineers,
    fetchProjects,
    fetchCapacityData,
    createAssignment,
    fetchAssignments,
  } = useStore();
  const navigate = useNavigate();

  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // First fetch engineers and assignments
        await Promise.all([fetchEngineers(), fetchProjects(), fetchAssignments()]);
        // Then fetch capacity data which depends on assignments
        await fetchCapacityData();
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();

    // Set up polling for capacity data and assignments
    const intervalId = setInterval(async () => {
      try {
        // First fetch assignments
        await fetchAssignments();
        // Then fetch capacity data which depends on assignments
        await fetchCapacityData();
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [fetchEngineers, fetchProjects, fetchAssignments, fetchCapacityData]);

  // Get unique skills from all engineers
  const allSkills = Array.from(
    new Set(engineers.flatMap((eng) => eng.skills || []))
  );

  const filteredEngineers = engineers.filter((engineer) => {
    const matchesSearch = engineer.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => engineer.skills?.includes(skill));
    return matchesSearch && matchesSkills;
  });

  const handleAssign = (engineerId: string) => {
    setSelectedEngineer(engineerId);
    setShowAssignmentForm(true);
  };

  const handleCloseAssignmentForm = () => {
    setSelectedEngineer(null);
    setShowAssignmentForm(false);
  };

  const handleViewDetails = (engineerId: string) => {
    navigate(`/engineers/${engineerId}`);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Engineers</h1>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search engineers..."
                className="w-full px-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <Button
                  key={skill}
                  variant={
                    selectedSkills.includes(skill) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEngineers.map((engineer) => {
              const defaultCapacity = {
                engineerId: engineer._id,
                totalCapacity: engineer.maxCapacity || 100,
                allocatedCapacity: 0,
                availableCapacity: engineer.maxCapacity || 100
              };
              
              return (
                <EngineerCard
                  key={engineer._id}
                  engineer={engineer}
                  capacityData={capacityData[engineer._id] || defaultCapacity}
                  onAssign={() => handleAssign(engineer._id)}
                  onViewDetails={() => handleViewDetails(engineer._id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {showAssignmentForm && selectedEngineer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">Assign to Project</h2>
            <AssignmentForm
              engineer={engineers.find((e) => e._id === selectedEngineer)}
              engineers={engineers}
              projects={projects}
              capacityData={capacityData}
              onSubmit={async (formData) => {
                try {
                  const assignmentData = {
                    ...formData,
                    startDate: new Date(formData.startDate),
                    endDate: new Date(formData.endDate),
                  };
                  await createAssignment(assignmentData);
                  handleCloseAssignmentForm();
                  // Refresh data after creating assignment
                  await Promise.all([
                    fetchEngineers(),
                    fetchProjects(),
                    fetchCapacityData(),
                  ]);
                  toast.success('Engineer assigned successfully');
                } catch (error: any) {
                  if (error.response?.data?.message === 'Engineer has overlapping assignments') {
                    toast.error('Engineer has overlapping assignments', {
                      description: 'This engineer already has assignments during the selected time period.',
                      duration: 5000,
                    });
                  } else {
                    toast.error('Failed to assign engineer', {
                      description: error.response?.data?.message || 'An error occurred while assigning the engineer',
                    });
                  }
                  console.error('Failed to create assignment:', error);
                }
              }}
              onCancel={handleCloseAssignmentForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
