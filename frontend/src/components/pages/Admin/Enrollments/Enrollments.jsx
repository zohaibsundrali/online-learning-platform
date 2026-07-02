import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import AdminLayout from '../../../layout/AdminLayout/AdminLayout';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../../common/Toast/ToastProvider';
import axiosInstance from '../../../../api/axios';

const Enrollments = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, [currentPage, statusFilter]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await axiosInstance.get(`/admin/enrollments?${params}`);
      if (response.data.success) {
        setEnrollments(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalEnrollments(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchEnrollments();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchEnrollments();
  };

  const handleUpdateStatus = async () => {
    if (!selectedEnrollment || !newStatus) return;
    
    try {
      const response = await axiosInstance.put(`/admin/enrollments/${selectedEnrollment._id}`, {
        status: newStatus,
      });
      if (response.data.success) {
        toast.success('Enrollment status updated successfully');
        setShowStatusModal(false);
        setSelectedEnrollment(null);
        setNewStatus('');
        fetchEnrollments();
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to update enrollment');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-primary bg-opacity-10 text-primary', label: 'Active' },
      completed: { color: 'bg-accent bg-opacity-10 text-accent', label: 'Completed' },
      dropped: { color: 'bg-text bg-opacity-10 text-text text-opacity-60', label: 'Dropped' },
    };
    return config[status] || config.active;
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-accent';
    if (progress >= 70) return 'bg-primary';
    if (progress >= 40) return 'bg-secondary';
    return 'bg-text bg-opacity-20';
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'dropped', label: 'Dropped' },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Enrollment Management</h1>
          <p className="text-text text-opacity-60 text-sm mt-1">
            Manage all course enrollments across the platform
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span className="text-sm text-text text-opacity-60">
            Total: {totalEnrollments}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text text-opacity-40" />
            <input
              type="text"
              placeholder="Search by student or course..."
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
            onClick={() => fetchEnrollments()}
            className="px-4 py-2 bg-background border border-border rounded-card text-text hover:border-primary transition-colors duration-300 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Enrollments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-text mb-2">No enrollments found</h4>
          <p className="text-text text-opacity-60">
            {searchTerm || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Enrollments will appear here once students enroll in courses'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Enrolled</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text text-opacity-60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => {
                  const statusBadge = getStatusBadge(enrollment.status);
                  return (
                    <tr key={enrollment._id} className="border-b border-border hover:bg-primary hover:bg-opacity-5 transition-colors duration-300">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background text-xs font-semibold">
                            {enrollment.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">{enrollment.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-text text-opacity-40">{enrollment.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={enrollment.course?.thumbnail || 'https://via.placeholder.com/32x32'}
                            alt={enrollment.course?.title}
                            className="w-8 h-8 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/32x32';
                            }}
                          />
                          <div>
                            <p className="text-sm text-text line-clamp-1">{enrollment.course?.title || 'Unknown'}</p>
                            <p className="text-xs text-text text-opacity-40">{enrollment.course?.category || 'General'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(enrollment.progress)}`}
                              style={{ width: `${enrollment.progress || 0}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            enrollment.progress === 100 ? 'text-accent' : 'text-primary'
                          }`}>
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-text text-opacity-60">
                        {formatDate(enrollment.enrolledAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setNewStatus(enrollment.status);
                              setShowStatusModal(true);
                            }}
                            className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title="Update Status"
                          >
                            <Eye className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
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
                Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalEnrollments)} of {totalEnrollments} enrollments
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

      {/* Update Status Modal */}
      {showStatusModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text">Update Enrollment Status</h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedEnrollment(null);
                  setNewStatus('');
                }}
                className="p-1 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
              >
                <X className="w-5 h-5 text-text" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-text text-opacity-60 mb-2">
                Student: <span className="font-semibold text-text">{selectedEnrollment.user?.name}</span>
              </p>
              <p className="text-sm text-text text-opacity-60 mb-4">
                Course: <span className="font-semibold text-text">{selectedEnrollment.course?.title}</span>
              </p>
              <label className="block text-sm font-medium text-text mb-1.5">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedEnrollment(null);
                  setNewStatus('');
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="btn-primary"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Enrollments;