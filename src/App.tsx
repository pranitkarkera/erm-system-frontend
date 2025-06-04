import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Dashboard from './pages/Dashboard';
import Engineers from './pages/Engineers';
import EngineerDetails from './pages/EngineerDetails';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Assignments from './pages/Assignments';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { Sidebar } from './components/Sidebar';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Profile from './pages/Profile';
import MyProjects from './components/projects/MyProjects';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" /> : <>{children}</>;
}

function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const user = useStore((state) => state.user);
  const fetchCurrentUser = useStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    // Fetch user data if token exists
    if (localStorage.getItem('token')) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  return (
    <Router future={{ v7_startTransition: true }}>
      <div className="flex h-screen bg-gray-100">
        {isAuthenticated && <Sidebar />}
        <div className="flex-1 overflow-auto">
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
      </div>
      <Toaster richColors position="top-right" />
    </Router>
  );
}

export default App;
