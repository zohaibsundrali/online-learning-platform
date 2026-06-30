import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../api/axios';

const InstructorContext = createContext();

export const InstructorProvider = ({ children }) => {
  const { user } = useAuth();
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'instructor' || user.role === 'admin')) {
      fetchInstructorData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchInstructorData = async () => {
    setLoading(true);
    try {
      const [coursesRes, statsRes] = await Promise.all([
        axiosInstance.get('/instructor/courses'),
        axiosInstance.get('/instructor/stats'),
      ]);

      setInstructorData({
        courses: coursesRes.data.data || [],
        stats: statsRes.data.data || {},
      });
    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshInstructorData = async () => {
    await fetchInstructorData();
  };

  return (
    <InstructorContext.Provider
      value={{
        instructorData,
        loading,
        refreshInstructorData,
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
};

export const useInstructor = () => {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error('useInstructor must be used within an InstructorProvider');
  }
  return context;
};

export default InstructorContext;