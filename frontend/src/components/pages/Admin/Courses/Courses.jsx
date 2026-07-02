import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '../../../layout/AdminLayout/AdminLayout';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../../common/Toast/ToastProvider';
import axiosInstance from '../../../../api/axios';

const Courses = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [currentPage, categoryFilter, statusFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await axiosInstance.get(`/admin/courses?${params}`);
      if (response.data.success) {
        setCourses(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCourses(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCourses();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchCourses();
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await axiosInstance.delete(`/admin/courses/${selectedCourse._id}`);
      if (response.data.success) {
        toast.success('Course deleted successfully');
        setShowDeleteModal(false);
        setSelectedCourse(null);
        fetchCourses();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleTogglePublish = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await axiosInstance.put(`/admin/courses/${selectedCourse._id}/toggle-publish`);
      if (response.data.success) {
        toast.success(response.data.message);
        setShowPublishModal(false);
        setSelectedCourse(null);
        fetchCourses();
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error(error.response?.data?.message || 'Failed to update course status');
    }
  };

  const handleViewDetails = async (courseId) => {
    try {
      const response = await axiosInstance.get(`/admin/courses/${courseId}`);
      if (response.data.success) {
        setCourseDetails(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (isPublished) => {
    return isPublished 
      ? { color: 'bg-accent bg-opacity-10 text-accent', label: 'Published' }
      : { color: 'bg-text bg-opacity-10 text-text text-opacity-60', label: 'Draft' };
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Course Management</h1>
          <p className="text-text text-opacity-60 text-sm mt-1">
            Manage all courses across the platform
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

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text text-opacity-40" />
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-card text-text placeholder-text placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text text-opacity-40 hover:text-primary transition-colors duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-background border border-border rounded-card text-text hover:border-primary transition-colors duration-300 flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => fetchCourses()}
            className="px-4 py-2 bg-background border border-border rounded-card text-text hover:border-primary transition-colors duration-300 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Draft</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Courses Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-text mb-2">No courses found</h4>
          <p className="text-text text-opacity-60">
            {searchTerm || categoryFilter || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Courses will appear here once created'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Instructor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Students</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text text-opacity-60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const statusBadge = getStatusBadge(course.isPublished);
                  return (
                    <tr key={course._id} className="border-b border-border hover:bg-primary hover:bg-opacity-5 transition-colors duration-300">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={course.thumbnail || 'https://via.placeholder.com/40x40'}
                            alt={course.title}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/40x40';
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-text line-clamp-1">{course.title}</p>
                            <p className="text-xs text-text text-opacity-40">{course.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-text text-opacity-60">
                        {course.category}
                      </td>
                      <td className="py-3 px-4 text-sm text-text text-opacity-60">
                        {course.instructor?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-sm text-text text-opacity-60">
                        {course.studentsEnrolled || 0}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-text">
                        {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(course._id)}
                            className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
                          </button>

                          <Link
                            to={`/instructor/course/${course._id}/edit`}
                            className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title="Edit Course"
                          >
                            <Edit className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
                          </Link>

                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowPublishModal(true);
                            }}
                            className="p-1.5 hover:bg-secondary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title={course.isPublished ? 'Unpublish Course' : 'Publish Course'}
                          >
                            {course.isPublished ? (
                              <EyeOff className="w-4 h-4 text-text hover:text-secondary transition-colors duration-300" />
                            ) : (
                              <Eye className="w-4 h-4 text-text hover:text-secondary transition-colors duration-300" />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 hover:bg-accent hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4 text-text hover:text-accent transition-colors duration-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-sm text-text text-opacity-40">
                Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCourses)} of {totalCourses} courses
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-primary hover:bg-opacity-10 transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-text" />
                </button>
                <span className="text-sm text-text">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-primary hover:bg-opacity-10 transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-text" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-text mb-2">Delete Course</h3>
            <p className="text-text text-opacity-60 mb-6">
              Are you sure you want to delete <span className="font-semibold text-text">{selectedCourse.title}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCourse(null);
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 bg-accent text-background rounded-card hover:bg-opacity-90 transition-all duration-300"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-text mb-2">
              {selectedCourse.isPublished ? 'Unpublish Course' : 'Publish Course'}
            </h3>
            <p className="text-text text-opacity-60 mb-6">
              Are you sure you want to {selectedCourse.isPublished ? 'unpublish' : 'publish'} <span className="font-semibold text-text">{selectedCourse.title}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setSelectedCourse(null);
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTogglePublish}
                className={`px-4 py-2 text-background rounded-card hover:bg-opacity-90 transition-all duration-300 ${
                  selectedCourse.isPublished ? 'bg-accent' : 'bg-primary'
                }`}
              >
                {selectedCourse.isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {showDetailsModal && courseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text">Course Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setCourseDetails(null);
                }}
                className="p-1 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
              >
                <X className="w-5 h-5 text-text" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={courseDetails.course?.thumbnail || 'https://via.placeholder.com/120x80'}
                  alt={courseDetails.course?.title}
                  className="w-32 h-20 object-cover rounded"
                />
                <div>
                  <h4 className="text-lg font-semibold text-text">{courseDetails.course?.title}</h4>
                  <p className="text-sm text-text text-opacity-60">{courseDetails.course?.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text text-opacity-40">Level</p>
                  <p className="text-text">{courseDetails.course?.level}</p>
                </div>
                <div>
                  <p className="text-sm text-text text-opacity-40">Price</p>
                  <p className="text-text">{courseDetails.course?.price === 0 ? 'Free' : `$${courseDetails.course?.price}`}</p>
                </div>
                <div>
                  <p className="text-sm text-text text-opacity-40">Students</p>
                  <p className="text-text">{courseDetails.course?.studentsEnrolled || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-text text-opacity-40">Modules</p>
                  <p className="text-text">{courseDetails.course?.modules?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-text text-opacity-40">Duration</p>
                  <p className="text-text">{formatDuration(courseDetails.course?.totalDuration || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-text text-opacity-40">Status</p>
                  <p className="text-text">{courseDetails.course?.isPublished ? 'Published' : 'Draft'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-text text-opacity-40">Description</p>
                <p className="text-text text-sm">{courseDetails.course?.description}</p>
              </div>

              <div>
                <p className="text-sm text-text text-opacity-40 mb-2">Enrollments ({courseDetails.enrollments?.length || 0})</p>
                <div className="bg-background rounded-card p-4">
                  {courseDetails.enrollments?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {courseDetails.enrollments.slice(0, 10).map((enrollment) => (
                        <div key={enrollment._id} className="flex items-center justify-between text-sm">
                          <span className="text-text">{enrollment.user?.name}</span>
                          <span className="text-text text-opacity-60">
                            {enrollment.progress || 0}% • {enrollment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text text-opacity-40 text-sm">No enrollments yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Courses;