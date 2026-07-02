import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FolderTree,
  FileText,
  Bell,
  
  LogOut,
  ChevronLeft,
  ChevronRight,

  X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/ToastProvider';

const AdminSidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(false);

const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/students', icon: GraduationCap, label: 'Students' },
  { path: '/admin/instructors', icon: Users, label: 'Instructors' },
  { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { path: '/admin/enrollments', icon: FileText, label: 'Enrollments' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300
          ${isMobile ? 'w-72' : collapsed ? 'w-20' : 'w-64'}
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">LH</span>
            </div>
            {(!collapsed || isMobile) && (
              <span className="font-display text-xl font-bold text-primary">LearnHub</span>
            )}
          </Link>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg hover:bg-primary hover:bg-opacity-10 transition-colors duration-300"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-text" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-text" />
              )}
            </button>
          )}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-primary hover:bg-opacity-10 transition-colors duration-300"
            >
              <X className="w-5 h-5 text-text" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300
                  ${active 
                    ? 'bg-primary bg-opacity-10 text-primary' 
                    : 'text-text text-opacity-60 hover:bg-primary hover:bg-opacity-5 hover:text-text'
                  }
                  ${collapsed && !isMobile ? 'justify-center' : ''}
                `}
                title={collapsed && !isMobile ? item.label : ''}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                {(!collapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className={`
              flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-accent hover:bg-accent hover:bg-opacity-10 transition-all duration-300
              ${collapsed && !isMobile ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5" />
            {(!collapsed || isMobile) && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;