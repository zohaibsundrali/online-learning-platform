import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  Menu, 
  X, 
  BookOpen, 
 
  LogOut, 
  Home,

  LayoutDashboard,
  PlusCircle,
 
  Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // Public nav links
  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/courses', label: 'Courses', icon: BookOpen },
  ];

  
 

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="font-display text-2xl font-bold text-primary">
              LearnHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-1 text-text hover:text-primary transition-colors duration-300"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4 relative">
                {/* Instructor Quick Actions */}
                {(user.role === 'instructor' || user.role === 'admin') && (
                  <Link
                    to="/instructor/course/new"
                    className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-full transition-all duration-300"
                    title="Create New Course"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-semibold text-sm">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm text-text hidden lg:block">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-card shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-semibold text-text">{user.name}</p>
                        <p className="text-xs text-text text-opacity-60">{user.email}</p>
                        <p className="text-xs text-primary mt-1 capitalize">{user.role}</p>
                      </div>

                      {/* Role-specific links in dropdown */}
                      {user.role === 'instructor' || user.role === 'admin' ? (
                        <>
                          <Link
                            to="/instructor/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-text hover:bg-primary hover:bg-opacity-10 transition-colors duration-300"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/instructor/course/new"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-text hover:bg-primary hover:bg-opacity-10 transition-colors duration-300"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>Create Course</span>
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-text hover:bg-primary hover:bg-opacity-10 transition-colors duration-300"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/dashboard/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-text hover:bg-primary hover:bg-opacity-10 transition-colors duration-300"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-accent hover:bg-accent hover:bg-opacity-10 transition-colors duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-6 py-2 text-text hover:text-primary transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-primary text-background rounded-full hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-text hover:text-primary transition-colors duration-300"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Public Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-3 text-text hover:bg-primary hover:bg-opacity-10 rounded-lg transition-all duration-300"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Role-specific Mobile Links */}
            {user && (
              <>
                {user.role === 'instructor' || user.role === 'admin' ? (
                  <>
                    <Link
                      to="/instructor/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 text-text hover:bg-primary hover:bg-opacity-10 rounded-lg transition-all duration-300"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Instructor Dashboard</span>
                    </Link>
                    <Link
                      to="/instructor/course/new"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg transition-all duration-300"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>Create Course</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 text-text hover:bg-primary hover:bg-opacity-10 rounded-lg transition-all duration-300"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
              </>
            )}

            {/* User Info & Logout */}
            {user ? (
              <>
                <div className="px-4 py-3 border-t border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-background font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{user.name}</p>
                      <p className="text-xs text-text text-opacity-60">{user.email}</p>
                      <p className="text-xs text-primary capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-3 text-accent hover:bg-accent hover:bg-opacity-10 rounded-lg transition-all duration-300 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-text hover:text-primary border border-border rounded-lg transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center bg-primary text-background rounded-lg hover:bg-opacity-90 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;