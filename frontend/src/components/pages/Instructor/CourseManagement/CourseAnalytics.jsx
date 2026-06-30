import React, { useState, useEffect,useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  TrendingUp, 
  DollarSign, 
  Clock,
  ArrowLeft,
  UserCheck,
  UserX,
  BarChart3,

  Search,

  CheckCircle,

  Play,
  BookOpen
} from 'lucide-react';
import { useToast } from '../../../common/Toast/ToastProvider';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import axiosInstance from '../../../../api/axios';

const CourseAnalytics = () => {
  const { courseId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [courseInfo, setCourseInfo] = useState(null);



 const fetchCourseInfo = useCallback(async () => {
  try {
    const response = await axiosInstance.get(`/instructor/course/${courseId}`);
    if (response.data.success) {
      setCourseInfo(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching course info:', error);
  }
}, [courseId]);

const fetchAnalytics = useCallback(async () => {
  try {
    const response = await axiosInstance.get(`/instructor/course/${courseId}/analytics`);
    if (response.data.success) {
      setAnalytics(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    toast.error('Failed to load analytics data');
  }
}, [courseId, toast]);

const fetchStudents = useCallback(async () => {
  setLoading(true);

  try {
    const response = await axiosInstance.get(`/instructor/course/${courseId}/students`);

    if (response.data.success) {
      setStudents(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    toast.error('Failed to load student data');
  } finally {
    setLoading(false);
  }
}, [courseId, toast]);

 useEffect(() => {
  fetchCourseInfo();
  fetchAnalytics();
  fetchStudents();
}, [fetchCourseInfo, fetchAnalytics, fetchStudents]);

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    return status === 'completed' 
      ? 'bg-accent bg-opacity-10 text-accent' 
      : 'bg-primary bg-opacity-10 text-primary';
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-accent';
    if (progress >= 70) return 'bg-primary';
    if (progress >= 40) return 'bg-secondary';
    return 'bg-text bg-opacity-20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/instructor/dashboard"
            className="text-text text-opacity-60 hover:text-primary transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-text">
              {courseInfo?.title || 'Course Analytics'}
            </h1>
            <p className="text-text text-opacity-60 text-sm">
              Track your course performance and student progress
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/course/${courseId}`}
            target="_blank"
            className="px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-full hover:bg-opacity-20 transition-colors duration-300 flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Course</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text text-opacity-60 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-text">{analytics?.totalStudents || 0}</p>
            </div>
            <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text text-opacity-60 text-sm">Completed</p>
              <p className="text-2xl font-bold text-text">{analytics?.completedStudents || 0}</p>
            </div>
            <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text text-opacity-60 text-sm">Avg Progress</p>
              <p className="text-2xl font-bold text-text">{analytics?.avgProgress || 0}%</p>
            </div>
            <div className="w-10 h-10 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text text-opacity-60 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-text">
                ${analytics?.revenue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors duration-300 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text text-opacity-60 hover:text-primary'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-6 py-3 font-medium transition-colors duration-300 whitespace-nowrap ${
            activeTab === 'students'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text text-opacity-60 hover:text-primary'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Students ({students.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Module Completion */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Module Completion Rates</span>
            </h3>
            <div className="space-y-4">
              {analytics?.moduleCompletion && analytics.moduleCompletion.length > 0 ? (
                analytics.moduleCompletion.map((module, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-text text-opacity-40">#{index + 1}</span>
                        <span className="text-text text-opacity-80">{module.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-text text-opacity-40">
                          {module.completed}/{module.total} completed
                        </span>
                        <span className={`font-semibold ${
                          module.percentage === 100 ? 'text-accent' : 
                          module.percentage >= 70 ? 'text-primary' : 
                          'text-text text-opacity-60'
                        }`}>
                          {module.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          module.percentage === 100 ? 'bg-accent' : 
                          module.percentage >= 70 ? 'bg-primary' : 
                          'bg-secondary'
                        }`}
                        style={{ width: `${module.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text text-opacity-60 text-sm">
                  No module completion data available yet.
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-text text-opacity-60">Completion Rate</p>
                  <p className="text-xl font-bold text-text">
                    {analytics?.completionRate || 0}%
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center space-x-3">
                <UserX className="w-5 h-5 text-text text-opacity-40" />
                <div>
                  <p className="text-sm text-text text-opacity-60">Active Students</p>
                  <p className="text-xl font-bold text-text">
                    {(analytics?.totalStudents || 0) - (analytics?.completedStudents || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-text text-opacity-60">Recent Enrollments</p>
                  <p className="text-xl font-bold text-text">
                    {analytics?.recentEnrollments || 0}
                  </p>
                  <p className="text-xs text-text text-opacity-40">Last 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-text flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Enrolled Students</span>
              <span className="text-sm text-text text-opacity-40 font-normal">
                ({students.length})
              </span>
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text text-opacity-40" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-card text-text placeholder-text placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-text text-opacity-20 mx-auto mb-3" />
              <p className="text-text text-opacity-60">
                {searchTerm ? 'No students match your search' : 'No students enrolled yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Progress</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Enrolled</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Last Access</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border hover:bg-primary hover:bg-opacity-5 transition-colors duration-300">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background text-xs font-semibold">
                            {student.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">{student.name}</p>
                            <p className="text-xs text-text text-opacity-40">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(student.progress)}`}
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            student.progress === 100 ? 'text-accent' : 'text-primary'
                          }`}>
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(student.status)}`}>
                          {student.status === 'completed' ? (
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <Play className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-text text-opacity-60">
                        {formatDate(student.enrolledAt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-text text-opacity-60">
                        {student.lastAccessed ? formatDate(student.lastAccessed) : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseAnalytics;