import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, UserCircle, LogOut, ClipboardList, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/index';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { Separator } from './ui/Separator';

export function Sidebar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const isManager = user?.role === 'manager';
  const isEngineer = user?.role === 'engineer';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900">ERM System</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {/* Dashboard only shown to managers */}
          {isManager && (
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                    isActive && "bg-gray-100 text-gray-900"
                  )
                }
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </NavLink>
            </li>
          )}

          {/* Engineers section only shown to managers */}
          {isManager && (
            <li>
              <NavLink
                to="/engineers"
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                    isActive && "bg-gray-100 text-gray-900"
                  )
                }
              >
                <Users className="h-5 w-5" />
                <span>Engineers</span>
              </NavLink>
            </li>
          )}

          {/* My Projects section only shown to engineers */}
          {isEngineer && (
            <li>
              <NavLink
                to="/my-projects"
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                    isActive && "bg-gray-100 text-gray-900"
                  )
                }
              >
                <Briefcase className="h-5 w-5" />
                <span>My Projects</span>
              </NavLink>
            </li>
          )}

          {/* Projects and Assignments sections only shown to managers */}
          {isManager && (
            <>
              <li>
                <NavLink
                  to="/projects"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                      isActive && "bg-gray-100 text-gray-900"
                    )
                  }
                >
                  <FolderKanban className="h-5 w-5" />
                  <span>Projects</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/assignments"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                      isActive && "bg-gray-100 text-gray-900"
                    )
                  }
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>Assignments</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="mt-auto">
        <Separator />
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-3 mb-2 hover:bg-gray-100"
            onClick={() => navigate("/profile")}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {user?.role}
              </p>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 