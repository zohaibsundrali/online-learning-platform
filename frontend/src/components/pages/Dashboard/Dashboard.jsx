import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  CheckCircle,
  Play,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/ToastProvider';
import Navbar from '../../layout/Navbar/Navbar';
import Footer from '../../layout/Footer/Footer';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import axiosInstance from '../../../api/axios';
import ProfileSettings from './ProfileSettings';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState(null);
  const isMounted = useRef(true);
  const fetchCount = useRef(0);

  // ✅ Fetch data function - NO toast.success inside
  const fetchDashboardData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchCount.current > 0) {
      console.log('⏭️ Skipping duplicate fetch');
      return;
    }
    
    fetchCount.current += 1;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching dashboard data... (Attempt:', fetchCount.current, ')');
      
      const response = await axiosInstance.get('/users/enrollments');
      console.log('📦 API Response:', response.data);
      
      if (response.data && response.data.success) {
        let courses = [];
        if (Array.isArray(response.data.data)) {
          courses = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.courses)) {
          courses = response.data.data.courses;
        } else if (response.data.data && Array.isArray(response.data.data.enrollments)) {
          courses = response.data.data.enrollments;
        }
        
        console.log('📚 Courses found:', courses.length);
        
        // ✅ Only update state if component is mounted
        if (isMounted.current) {
          setEnrolledCourses(courses);
          
          const total = courses.length;
          const completed = courses.filter(c => c.progress === 100).length;
          const totalHours = courses.reduce((sum, c) => sum + (c.totalDuration || 0), 0) / 60;
          const avgProgress = total > 0 
            ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / total)
            : 0;
          
          setStats({
            totalCourses: total,
            completedCourses: completed,
            totalHours: Math.round(totalHours),
            averageProgress: avgProgress,
          });
        }
      } else {
        const errorMsg = response.data?.message || 'Failed to load dashboard data';
        if (isMounted.current) {
          setError(errorMsg);
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      let errorMessage = 'Failed to load dashboard data';
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.statusText || errorMessage;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      if (isMounted.current) {
        setError(errorMessage);
        toast.error(errorMessage);
        setEnrolledCourses([]);
        setStats({
          totalCourses: 0,
          completedCourses: 0,
          totalHours: 0,
          averageProgress: 0,
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        console.log('✅ Dashboard data fetch completed, loading set to false');
      }
    }
  }, [toast]); // ✅ Keep toast in dependencies but don't call toast.success

  // ✅ Run only once on mount
  useEffect(() => {
    isMounted.current = true;
    fetchDashboardData();
    
    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, []); // ✅ EMPTY dependency array - runs only once

  // ✅ Certificate Download Handler
  const handleDownloadCertificate = async (enrollmentId, courseTitle) => {
    if (!enrollmentId) {
      toast.error('Invalid enrollment ID');
      return;
    }

    setDownloadingCertificate(enrollmentId);
    const toastId = toast.loading(`Generating certificate for ${courseTitle || 'course'}...`);

    try {
      const response = await axiosInstance.get(`/certificates/${enrollmentId}`, {
        responseType: 'blob',
      });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('pdf')) {
        throw new Error('Invalid certificate format');
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `certificate_${courseTitle?.replace(/\s+/g, '_') || 'course'}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success('🎉 Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.dismiss(toastId);
      
      let errorMessage = 'Failed to download certificate';
      if (error.response?.status === 404) {
        errorMessage = 'Certificate not found. Please complete the course first.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You are not authorized to download this certificate.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setDownloadingCertificate(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout');
    }
  };

  // ✅ Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-text mb-2">Something went wrong</h2>
            <p className="text-text text-opacity-60 mb-6">{error}</p>
            <button
              onClick={() => {
                fetchCount.current = 0;
                fetchDashboardData();
              }}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-text text-opacity-60 mt-4">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Dashboard Header */}
      <section className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-background text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-text">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="text-text text-opacity-60 text-sm">
                  {user?.role === 'instructor' ? 'Instructor' : 'Student'} • {user?.email || 'No email'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Link
                to="/courses"
                className="px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-full hover:bg-opacity-20 transition-colors duration-300 flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Browse Courses</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-accent bg-opacity-10 text-accent rounded-full hover:bg-opacity-20 transition-colors duration-300 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text text-opacity-60 text-sm">Enrolled</p>
                <p className="text-2xl font-bold text-text">{stats.totalCourses}</p>
              </div>
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text text-opacity-60 text-sm">Completed</p>
                <p className="text-2xl font-bold text-text">{stats.completedCourses}</p>
              </div>
              <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-accent" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text text-opacity-60 text-sm">Hours Learned</p>
                <p className="text-2xl font-bold text-text">{stats.totalHours}h</p>
              </div>
              <div className="w-10 h-10 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text text-opacity-60 text-sm">Avg Progress</p>
                <p className="text-2xl font-bold text-text">{stats.averageProgress}%</p>
              </div>
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Tabs */}
        <div className="flex border-b border-border mb-8 overflow-x-auto">
          {['overview', 'courses', 'progress', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text text-opacity-60 hover:text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Courses */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-text">
                    Your Courses
                  </h3>
                  <Link
                    to="/courses"
                    className="text-sm text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {!enrolledCourses || enrolledCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-text text-opacity-20 mx-auto mb-3" />
                    <p className="text-text text-opacity-60">
                      You haven't enrolled in any courses yet.
                    </p>
                    <Link
                      to="/courses"
                      className="btn-primary inline-block mt-4"
                    >
                      Explore Courses
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 3).map((course) => (
                      <div key={course._id || course.id} className="flex items-center space-x-4 p-3 bg-background rounded-card hover:bg-opacity-50 transition-colors duration-300">
                        <img
                          src={course.thumbnail || 'https://via.placeholder.com/80x56'}
                          alt={course.title || 'Course'}
                          className="w-20 h-14 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x56';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/course/${course._id || course.id}`}
                            className="font-semibold text-text hover:text-primary transition-colors duration-300 line-clamp-1"
                          >
                            {course.title || 'Untitled Course'}
                          </Link>
                          <div className="flex items-center space-x-4 text-xs text-text text-opacity-60 mt-1">
                            <span>{course.category || 'General'}</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{Math.round((course.totalDuration || 0) / 60)}h</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">
                            {course.progress || 0}%
                          </div>
                          <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                          {course.progress === 100 && (
                            <button
                              onClick={() => handleDownloadCertificate(course.enrollmentId, course.title)}
                              disabled={downloadingCertificate === course.enrollmentId}
                              className="mt-2 text-xs bg-accent text-background px-3 py-1 rounded-full hover:bg-opacity-90 transition-all duration-300 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingCertificate === course.enrollmentId ? (
                                <>
                                  <LoadingSpinner size="sm" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Award className="w-3 h-3" />
                                  <span>Get Certificate</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="card">
                <h4 className="font-semibold text-text mb-3">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text text-opacity-60">Courses in progress</span>
                    <span className="text-text">
                      {stats.totalCourses - stats.completedCourses}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text text-opacity-60">Certificates earned</span>
                    <span className="text-text">{stats.completedCourses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text text-opacity-60">Learning streak</span>
                    <span className="text-text">3 days</span>
                  </div>
                </div>
              </div>

              {/* Upcoming */}
              <div className="card">
                <h4 className="font-semibold text-text mb-3 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Upcoming</span>
                </h4>
                <p className="text-sm text-text text-opacity-60">
                  No upcoming deadlines. Keep learning!
                </p>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h4 className="font-semibold text-text mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Link
                    to="/courses"
                    className="flex items-center space-x-2 text-sm text-text hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-primary hover:bg-opacity-5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Browse new courses</span>
                  </Link>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center space-x-2 text-sm text-text hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-primary hover:bg-opacity-5 w-full text-left"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Update profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-text">
                All Enrolled Courses ({enrolledCourses?.length || 0})
              </h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 bg-card border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>All Progress</option>
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            {!enrolledCourses || enrolledCourses.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-text mb-2">No courses yet</h4>
                <p className="text-text text-opacity-60">
                  Start your learning journey by enrolling in a course.
                </p>
                <Link to="/courses" className="btn-primary inline-block mt-4">
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <div key={course._id || course.id} className="card hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <img
                        src={course.thumbnail || 'https://via.placeholder.com/96x80'}
                        alt={course.title || 'Course'}
                        className="w-24 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/96x80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/course/${course._id || course.id}`}
                          className="font-semibold text-text hover:text-primary transition-colors duration-300 line-clamp-1"
                        >
                          {course.title || 'Untitled Course'}
                        </Link>
                        <p className="text-xs text-text text-opacity-60 mt-1">
                          {course.category || 'General'} • {course.level || 'All Levels'}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text text-opacity-60">Progress</span>
                            <span className="text-primary font-semibold">{course.progress || 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 mt-2 flex-wrap gap-2">
                          {course.progress === 100 ? (
                            <span className="flex items-center space-x-1 text-xs text-accent">
                              <Award className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          ) : course.progress > 0 ? (
                            <span className="flex items-center space-x-1 text-xs text-primary">
                              <Play className="w-3 h-3" />
                              <span>In Progress</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-xs text-text text-opacity-40">
                              <Clock className="w-3 h-3" />
                              <span>Not Started</span>
                            </span>
                          )}
                          <Link
                            to={`/course/${course._id || course.id}`}
                            className="text-xs text-primary hover:text-secondary transition-colors duration-300"
                          >
                            Continue →
                          </Link>
                          {course.progress === 100 && (
                            <button
                              onClick={() => handleDownloadCertificate(course.enrollmentId, course.title)}
                              disabled={downloadingCertificate === course.enrollmentId}
                              className="text-xs bg-accent text-background px-3 py-1 rounded-full hover:bg-opacity-90 transition-all duration-300 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingCertificate === course.enrollmentId ? (
                                <>
                                  <LoadingSpinner size="sm" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Award className="w-3 h-3" />
                                  <span>Get Certificate</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            <h3 className="text-xl font-semibold text-text mb-6">Learning Progress</h3>
            {!enrolledCourses || enrolledCourses.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
                <p className="text-text text-opacity-60">No progress data available.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {enrolledCourses.map((course) => (
                  <div key={course._id || course.id} className="card">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                      <div className="flex-1">
                        <Link
                          to={`/course/${course._id || course.id}`}
                          className="font-semibold text-text hover:text-primary transition-colors duration-300"
                        >
                          {course.title || 'Untitled Course'}
                        </Link>
                        <p className="text-sm text-text text-opacity-60">
                          {course.moduleCount || 0} modules • {Math.round((course.totalDuration || 0) / 60)} hours
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 mt-3 md:mt-0">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">
                            {course.progress || 0}%
                          </div>
                          <div className="w-32 h-2 bg-background rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                        </div>
                        {course.progress === 100 ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-accent" />
                            <button
                              onClick={() => handleDownloadCertificate(course.enrollmentId, course.title)}
                              disabled={downloadingCertificate === course.enrollmentId}
                              className="text-xs bg-accent text-background px-3 py-1 rounded-full hover:bg-opacity-90 transition-all duration-300 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingCertificate === course.enrollmentId ? (
                                <>
                                  <LoadingSpinner size="sm" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Award className="w-3 h-3" />
                                  <span>Get Certificate</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <CheckCircle className="w-5 h-5 text-text text-opacity-20" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileSettings />
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;