import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Validate token by fetching user data
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Get current user
  const getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      if (response.data.success) {
        const { token, data } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Login
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      if (response.data.success) {
        const { token, data } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axiosInstance.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;