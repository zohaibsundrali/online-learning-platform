import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  User,
  Shield,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '../../../layout/AdminLayout/AdminLayout';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../../common/Toast/ToastProvider';
import axiosInstance from '../../../../api/axios';

const Users = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await axiosInstance.get(`/admin/users?${params}`);
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalUsers(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await axiosInstance.delete(`/admin/users/${selectedUser._id}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await axiosInstance.put(`/admin/users/${selectedUser._id}/toggle-status`);
      if (response.data.success) {
        toast.success(response.data.message);
        setShowStatusModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      const response = await axiosInstance.put(`/admin/users/${selectedUser._id}/reset-password`, {
        newPassword,
      });
      if (response.data.success) {
        toast.success('Password reset successfully');
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setNewPassword('');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: { color: 'bg-primary bg-opacity-10 text-primary', label: 'Admin' },
      instructor: { color: 'bg-secondary bg-opacity-10 text-secondary', label: 'Instructor' },
      student: { color: 'bg-accent bg-opacity-10 text-accent', label: 'Student' },
    };
    return config[role] || config.student;
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? { color: 'bg-accent bg-opacity-10 text-accent', label: 'Active' }
      : { color: 'bg-text bg-opacity-10 text-text text-opacity-60', label: 'Suspended' };
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">User Management</h1>
          <p className="text-text text-opacity-60 text-sm mt-1">
            Manage all users across the platform
          </p>
        </div>
        <button
          onClick={() => toast.info('User creation form coming soon')}
          className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text text-opacity-40" />
            <input
              type="text"
              placeholder="Search users by name or email..."
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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-background border border-border rounded-card text-text hover:border-primary transition-colors duration-300 flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchUsers()}
            className="px-4 py-2 bg-background border border-border rounded-card text-text hover:border-primary transition-colors duration-300 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
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
                <option value="active">Active</option>
                <option value="inactive">Suspended</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-text mb-2">No users found</h4>
          <p className="text-text text-opacity-60">
            {searchTerm || roleFilter || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Users will appear here once they register'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Last Login</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text text-opacity-60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const statusBadge = getStatusBadge(user.isActive);
                  return (
                    <tr key={user._id} className="border-b border-border hover:bg-primary hover:bg-opacity-5 transition-colors duration-300">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background text-xs font-semibold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">{user.name}</p>
                            <p className="text-xs text-text text-opacity-40">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-text text-opacity-60">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-text text-opacity-60">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          {/* View */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              toast.info('User profile coming soon');
                            }}
                            className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              toast.info('Edit user coming soon');
                            }}
                            className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewPassword('');
                              setShowResetPasswordModal(true);
                            }}
                            className="p-1.5 hover:bg-secondary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title="Reset Password"
                          >
                            <RefreshCw className="w-4 h-4 text-text hover:text-secondary transition-colors duration-300" />
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowStatusModal(true);
                            }}
                            className="p-1.5 hover:bg-accent hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title={user.isActive ? 'Suspend User' : 'Activate User'}
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4 text-text hover:text-accent transition-colors duration-300" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-text hover:text-accent transition-colors duration-300" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 hover:bg-accent hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                            title="Delete User"
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
                Showing {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
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
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-text mb-2">Delete User</h3>
            <p className="text-text text-opacity-60 mb-6">
              Are you sure you want to delete <span className="font-semibold text-text">{selectedUser.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-accent text-background rounded-card hover:bg-opacity-90 transition-all duration-300"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-text mb-2">
              {selectedUser.isActive ? 'Suspend User' : 'Activate User'}
            </h3>
            <p className="text-text text-opacity-60 mb-6">
              Are you sure you want to {selectedUser.isActive ? 'suspend' : 'activate'} <span className="font-semibold text-text">{selectedUser.name}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-background rounded-card hover:bg-opacity-90 transition-all duration-300 ${
                  selectedUser.isActive ? 'bg-accent' : 'bg-primary'
                }`}
              >
                {selectedUser.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-text mb-2">Reset Password</h3>
            <p className="text-text text-opacity-60 mb-4">
              Reset password for <span className="font-semibold text-text">{selectedUser.name}</span>
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              className="w-full px-4 py-2 bg-background border border-border rounded-card text-text placeholder-text placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-primary text-background rounded-card hover:bg-opacity-90 transition-all duration-300"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Users;