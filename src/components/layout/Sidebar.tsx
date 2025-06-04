import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, UserCircle, LogOut, ClipboardList, Briefcase, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/index';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Separator } from '../ui/Separator';

export function Sidebar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const isManager = user?.role === 'manager';
  const isEngineer = user?.role === 'engineer';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const NavContent = () => (
    <div className="flex flex-col min-h-full">
      <div className="flex-shrink-0 p-4">
        <h1 className="text-2xl font-bold text-gray-900">ERM System</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {/* Navigation items */}
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
                onClick={closeMobileMenu}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </NavLink>
            </li>
          )}

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
                onClick={closeMobileMenu}
              >
                <Users className="h-5 w-5" />
                <span>Engineers</span>
              </NavLink>
            </li>
          )}

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
                onClick={closeMobileMenu}
              >
                <Briefcase className="h-5 w-5" />
                <span>My Projects</span>
              </NavLink>
            </li>
          )}

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
                  onClick={closeMobileMenu}
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
                  onClick={closeMobileMenu}
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>Assignments</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="flex-shrink-0 border-t border-gray-200">
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-3 mb-2 hover:bg-gray-100"
            onClick={() => {
              navigate("/profile");
              closeMobileMenu();
            }}
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

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full bg-white shadow-md"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50 transition-opacity",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileMenu}
      >
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 bg-white border-r border-gray-200">
        <div className="w-full">
          <NavContent />
        </div>
      </div>
    </>
  );
} 