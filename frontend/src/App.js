import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast/ToastProvider';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';

// Import pages
import LandingPage from './components/pages/Landing/LandingPage';
import Login from './components/pages/Auth/Login';
import Register from './components/pages/Auth/Register';
import CourseListing from './components/pages/Courses/CourseListing';
import CourseDetails from './components/pages/Courses/CourseDetails';
import Dashboard from './components/pages/Dashboard/Dashboard';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseListing />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            {/* Protected routes */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;