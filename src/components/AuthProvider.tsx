import { useEffect } from 'react';
import { useStore } from '../store';
import axios from '../utils/axios';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const fetchCurrentUser = useStore((state) => state.fetchCurrentUser);
  const setAuth = useStore((state) => state.setAuth);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Set the token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Try to fetch current user
          await fetchCurrentUser();
        } catch (error) {
          // If fetching user fails, clear auth state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuth({ token: null, user: null, isAuthenticated: false });
        }
      }
    };

    initializeAuth();
  }, [token, fetchCurrentUser, setAuth]);

  return <>{children}</>;
}; 