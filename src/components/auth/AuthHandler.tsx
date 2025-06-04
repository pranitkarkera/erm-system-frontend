import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/index';

export const AuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useStore();

  const initializeAuth = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('loggedInUser');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!user) {
          useStore.setState({ 
            user: parsedUser,
            token: storedToken,
            isAuthenticated: true
          });
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        navigate('/login', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleRedirect = useCallback(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate(parsedUser?.role === 'engineer' ? '/my-projects' : '/', { replace: true });
    } else if (!isAuthenticated && !location.pathname.match(/^\/(login|signup)$/)) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle redirects
  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return null;
}; 