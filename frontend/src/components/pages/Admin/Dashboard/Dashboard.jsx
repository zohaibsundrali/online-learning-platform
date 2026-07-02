import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  UserPlus,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from '../../../layout/AdminLayout/AdminLayout';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../../common/Toast/ToastProvider';
import axiosInstance from '../../../../api/axios';

const AdminDashboard = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
    },
    {
      title: 'Students',
      value: stats?.users?.students || 0,
      icon: GraduationCap,
      color: 'text-secondary',
      bgColor: 'bg-secondary bg-opacity-10',
    },
    {
      title: 'Instructors',
      value: stats?.users?.instructors || 0,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent bg-opacity-10',
    },
    {
      title: 'Total Courses',
      value: stats?.courses?.total || 0,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
    },
    {
      title: 'Published Courses',
      value: stats?.courses?.published || 0,
      icon: BookOpen,
      color: 'text-secondary',
      bgColor: 'bg-secondary bg-opacity-10',
    },
    {
      title: 'Active Enrollments',
      value: stats?.enrollments?.active || 0,
      icon: FileText,
      color: 'text-accent',
      bgColor: 'bg-accent bg-opacity-10',
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.revenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
    },
    {
      title: 'Active Users',
      value: stats?.users?.active || 0,
      icon: UserCheck,
      color: 'text-secondary',
      bgColor: 'bg-secondary bg-opacity-10',
    },
  ];

  const COLORS = ['#8AA39B', '#C08B5C', '#E07A5F', '#6D5F60'];

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
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-text text-opacity-60 text-sm mt-1">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text text-opacity-60 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-text">{card.value}</p>
                </div>
                <div className={`w-10 h-10 ${card.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Registrations */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Monthly Registrations</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts?.monthlyRegistrations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6D5F60" />
                <XAxis 
                  dataKey="_id" 
                  tickFormatter={(value) => `${value.month}/${value.year}`}
                  stroke="#DBE2DC"
                  tick={{ fill: '#DBE2DC' }}
                />
                <YAxis stroke="#DBE2DC" tick={{ fill: '#DBE2DC' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#5B4D4E', border: '1px solid #6D5F60' }}
                  labelStyle={{ color: '#DBE2DC' }}
                />
                <Bar dataKey="count" fill="#8AA39B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">User Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.charts?.userDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="count"
                >
                  {stats?.charts?.userDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#5B4D4E', border: '1px solid #6D5F60' }}
                  labelStyle={{ color: '#DBE2DC' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {stats?.recent?.registrations?.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary hover:bg-opacity-5 transition-colors duration-300">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background text-xs font-semibold">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{user.name}</p>
                  <p className="text-xs text-text text-opacity-40">{user.email}</p>
                </div>
                <span className="text-xs text-text text-opacity-40 capitalize">{user.role}</span>
              </div>
            ))}
            {(!stats?.recent?.registrations || stats.recent.registrations.length === 0) && (
              <p className="text-text text-opacity-40 text-sm">No recent registrations</p>
            )}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text mb-4">Recent Courses</h3>
          <div className="space-y-3">
            {stats?.recent?.courses?.slice(0, 5).map((course) => (
              <div key={course._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-primary hover:bg-opacity-5 transition-colors duration-300">
                <div>
                  <p className="text-sm font-medium text-text">{course.title}</p>
                  <p className="text-xs text-text text-opacity-40">{course.category}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${course.isPublished ? 'bg-accent bg-opacity-10 text-accent' : 'bg-text bg-opacity-10 text-text text-opacity-60'}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
            {(!stats?.recent?.courses || stats.recent.courses.length === 0) && (
              <p className="text-text text-opacity-40 text-sm">No recent courses</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;