import React, { useState, useEffect } from 'react';
import {
  Bell,
  UserPlus,
  BookOpen,
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';
import AdminLayout from '../../../layout/AdminLayout/AdminLayout';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../../common/Toast/ToastProvider';
import axiosInstance from '../../../../api/axios';

const Notifications = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    const icons = {
      registration: UserPlus,
      course: BookOpen,
      enrollment: GraduationCap,
      instructor: Users,
    };
    const Icon = icons[type] || Bell;
    return <Icon className="w-5 h-5" />;
  };

  const getColor = (type) => {
    const colors = {
      registration: 'text-primary',
      course: 'text-secondary',
      enrollment: 'text-accent',
      instructor: 'text-primary',
    };
    return colors[type] || 'text-text';
  };

  const getBgColor = (type) => {
    const colors = {
      registration: 'bg-primary bg-opacity-10',
      course: 'bg-secondary bg-opacity-10',
      enrollment: 'bg-accent bg-opacity-10',
      instructor: 'bg-primary bg-opacity-10',
    };
    return colors[type] || 'bg-background';
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.type === filter);
  };

  const filteredNotifications = getFilteredNotifications();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Notifications</h1>
          <p className="text-text text-opacity-60 text-sm mt-1">
            Stay updated with platform activities
          </p>
        </div>
        <button
          onClick={() => fetchNotifications()}
          className="btn-secondary flex items-center space-x-2 mt-4 md:mt-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
            filter === 'all'
              ? 'bg-primary text-background'
              : 'bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('registration')}
          className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
            filter === 'registration'
              ? 'bg-primary text-background'
              : 'bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10'
          }`}
        >
          Registrations ({notifications.filter(n => n.type === 'registration').length})
        </button>
        <button
          onClick={() => setFilter('course')}
          className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
            filter === 'course'
              ? 'bg-primary text-background'
              : 'bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10'
          }`}
        >
          Courses ({notifications.filter(n => n.type === 'course').length})
        </button>
        <button
          onClick={() => setFilter('enrollment')}
          className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
            filter === 'enrollment'
              ? 'bg-primary text-background'
              : 'bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10'
          }`}
        >
          Enrollments ({notifications.filter(n => n.type === 'enrollment').length})
        </button>
        <button
          onClick={() => setFilter('instructor')}
          className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
            filter === 'instructor'
              ? 'bg-primary text-background'
              : 'bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10'
          }`}
        >
          Instructors ({notifications.filter(n => n.type === 'instructor').length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-text mb-2">No notifications</h4>
          <p className="text-text text-opacity-60">
            {filter !== 'all' 
              ? `No ${filter} notifications available`
              : 'All caught up! No new notifications'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => {
            const Icon = getIcon(notification.type);
            const color = getColor(notification.type);
            const bgColor = getBgColor(notification.type);
            
            return (
              <div
                key={index}
                className="card hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${bgColor}`}>
                    <div className={color}>
                      {Icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-text">{notification.title}</h4>
                        <p className="text-text text-opacity-60 text-sm mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-text text-opacity-40 whitespace-nowrap ml-4">
                        {notification.count} items
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                      <button className="text-xs text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Mark as read</span>
                      </button>
                      <button className="text-xs text-accent hover:text-opacity-80 transition-colors duration-300 flex items-center space-x-1">
                        <XCircle className="w-3 h-3" />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mark All as Read */}
      {notifications.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            className="text-sm text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export default Notifications;