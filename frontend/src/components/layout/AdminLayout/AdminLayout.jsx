import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';

const AdminLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      <AdminSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <AdminHeader
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;