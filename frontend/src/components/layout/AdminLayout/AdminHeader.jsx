import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminHeader = ({ toggleSidebar, isDarkMode, toggleDarkMode }) => {
  const { user } = useAuth();

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-primary hover:bg-opacity-10 transition-colors duration-300 lg:hidden"
        >
          <Menu className="w-5 h-5 text-text" />
        </button>
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text text-opacity-40" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-primary hover:bg-opacity-10 transition-colors duration-300"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-text" />
          ) : (
            <Moon className="w-5 h-5 text-text" />
          )}
        </button>

        <Link
          to="/admin/notifications"
          className="p-2 rounded-lg hover:bg-primary hover:bg-opacity-10 transition-colors duration-300 relative"
        >
          <Bell className="w-5 h-5 text-text" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </Link>

        <div className="flex items-center space-x-3 pl-3 border-l border-border">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-semibold text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text">{user?.name || 'Admin'}</p>
            <p className="text-xs text-text text-opacity-40 capitalize">{user?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;