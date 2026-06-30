import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../common/Toast/ToastProvider';
import Navbar from '../../../layout/Navbar/Navbar';
import Footer from '../../../layout/Footer/Footer';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import StatsCards from './StatsCards';
import CourseCard from './CourseCard';
import axiosInstance from '../../../../api/axios';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Check if user is instructor
    if (user && user.role !== 'instructor' && user.role !== 'admin') {
      toast.error('You do not have instructor access');
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const coursesRes = await axiosInstance.get('/instructor/courses');
      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
      }

      // Fetch stats
      const statsRes = await axiosInstance.get('/instructor/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (courseId) => {
    try {
      const response = await axiosInstance.put(`/instructor/course/${courseId}/publish`);
      if (response.data.success) {
        toast.success(response.data.message);
        // Update local state
        setCourses(courses.map(course => 
          course._id === courseId 
            ? { ...course, isPublished: response.data.data.isPublished }
            : course
        ));
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error(error.response?.data?.message || 'Failed to update publish status');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/instructor/course/${courseId}`);
      if (response.data.success) {
        toast.success('Course deleted successfully');
        setCourses(courses.filter(course => course._id !== courseId));
        // Refresh stats
        const statsRes = await axiosInstance.get('/instructor/stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(c => filter === 'published' ? c.isPublished : !c.isPublished);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-text">
                Instructor Dashboard
              </h1>
              <p className="text-text text-opacity-60 text-sm">
                Manage your courses and track your performance
              </p>
            </div>
            <Link
              to="/instructor/course/new"
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards stats={stats} />
      </section>

      {/* Courses List */}
      <section className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text">Your Courses</h2>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-primary text-background'
                  : 'bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10'
              }`}
            >
              All ({courses.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                filter === 'published'
                  ? 'bg-accent text-background'
                  : 'bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10'
              }`}
            >
              Published ({courses.filter(c => c.isPublished).length})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                filter === 'draft'
                  ? 'bg-text text-background'
                  : 'bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10'
              }`}
            >
              Draft ({courses.filter(c => !c.isPublished).length})
            </button>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-text mb-2">
              {filter === 'all' ? 'No courses created yet' : 'No courses in this category'}
            </h4>
            <p className="text-text text-opacity-60">
              {filter === 'all' 
                ? 'Start creating your first course today!' 
                : 'Try changing your filter or create a new course'}
            </p>
            {filter === 'all' && (
              <Link to="/instructor/course/new" className="btn-primary inline-block mt-4">
                Create New Course
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onPublish={handlePublish}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default InstructorDashboard;