import React from 'react';
import { useStore } from '../store';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Profile() {
  const { user } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-2 hover:bg-gray-100"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-600">
              {getInitials(user.name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                {user.role}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1 text-sm text-gray-900">{user.department || 'Not specified'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Seniority Level</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{user.seniority || 'Not specified'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Max Capacity</h3>
                <p className="mt-1 text-sm text-gray-900">{user.maxCapacity ? `${user.maxCapacity} hours/week` : 'Not specified'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 