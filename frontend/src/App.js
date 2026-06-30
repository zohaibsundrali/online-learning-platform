import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast/ToastProvider';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute/RoleBasedRoute';

// Public Pages
import LandingPage from './components/pages/Landing/LandingPage';
import Login from './components/pages/Auth/Login';
import Register from './components/pages/Auth/Register';
import CourseListing from './components/pages/Courses/CourseListing';
import CourseDetails from './components/pages/Courses/CourseDetails';

// Student Pages
import Dashboard from './components/pages/Dashboard/Dashboard';
import LearningPage from './components/pages/Learning/LearningPage';

// Instructor Pages
import InstructorDashboard from './components/pages/Instructor/Dashboard/InstructorDashboard';
import CourseForm from './components/pages/Instructor/CourseManagement/CourseForm';
import CourseAnalytics from './components/pages/Instructor/CourseManagement/CourseAnalytics';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseListing />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            
            {/* Student Protected Routes */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/learning/:enrollmentId" element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            } />
            
            {/* Instructor Protected Routes */}
            <Route path="/instructor/dashboard" element={
              <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/instructor/course/new" element={
              <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
                <CourseForm />
              </RoleBasedRoute>
            } />
            <Route path="/instructor/course/:courseId/edit" element={
              <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
                <CourseForm />
              </RoleBasedRoute>
            } />
            <Route path="/instructor/course/:courseId/analytics" element={
              <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
                <CourseAnalytics />
              </RoleBasedRoute>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;