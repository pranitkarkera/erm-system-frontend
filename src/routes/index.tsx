import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '../store/index';
import Dashboard from '../pages/manager/Dashboard';
import Engineers from '../pages/manager/Engineers';
import EngineerDetails from '../pages/manager/EngineerDetails';
import Projects from '../pages/manager/Projects';
import ProjectDetails from '../pages/manager/ProjectDetails';
import Assignments from '../pages/manager/Assignments';
import Login from '../pages/profile/Login';
import SignUp from '../pages/profile/SignUp';
import Profile from '../pages/profile/Profile';
import MyProjects from '../pages/engineer/MyProjects';
import { Sidebar } from '../components/layout/Sidebar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" /> : <>{children}</>;
}

const AppRoutes = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const user = useStore((state) => state.user);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {isAuthenticated && (
        <div className="fixed inset-y-0 left-0 z-40">
          <Sidebar />
        </div>
      )}
      <main className={`flex-1 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  {user?.role === 'engineer' ? (
                    <Navigate to="/my-projects" replace />
                  ) : (
                    <Dashboard />
                  )}
                </PrivateRoute>
              }
            />
            <Route
              path="/engineers"
              element={
                <PrivateRoute>
                  <Engineers />
                </PrivateRoute>
              }
            />
            <Route
              path="/engineers/:id"
              element={
                <PrivateRoute>
                  <EngineerDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <ProjectDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <PrivateRoute>
                  <Assignments />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-projects"
              element={
                <PrivateRoute>
                  <MyProjects />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AppRoutes; 