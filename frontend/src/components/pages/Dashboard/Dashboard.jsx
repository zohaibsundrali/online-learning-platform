import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
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
  Search,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../common/Toast/ToastProvider";
import Navbar from "../../layout/Navbar/Navbar";
import Footer from "../../layout/Footer/Footer";
import LoadingSpinner from "../../common/LoadingSpinner/LoadingSpinner";
import axiosInstance from "../../../api/axios";
import ProfileSettings from "./ProfileSettings";
import ProgressCharts from "./ProgressCharts";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress");
  const [sortOrder, setSortOrder] = useState("desc");
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    notStartedCourses: 0,
    totalHours: 0,
    averageProgress: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const isMounted = useRef(true);
  const fetchCount = useRef(0);

  // ✅ Helper function to determine course status
  const getCourseStatus = (course) => {
    // If course has status field and it's 'completed'
    if (course.status === 'completed' || course.isCompleted === true) {
      return 'completed';
    }
    // If progress is 100, it's completed
    if (course.progress === 100) {
      return 'completed';
    }
    // If progress is 0, not started
    if (course.progress === 0) {
      return 'not-started';
    }
    // Otherwise in progress
    return 'in-progress';
  };

  // ✅ Get status badge configuration
  const getStatusBadge = (status) => {
    const config = {
      "not-started": {
        label: "Not Started",
        color: "text-text bg-text bg-opacity-10",
        icon: <Clock className="w-3 h-3" />
      },
      "in-progress": {
        label: "In Progress",
        color: "text-primary bg-primary bg-opacity-10",
        icon: <Play className="w-3 h-3" />
      },
      "completed": {
        label: "Completed",
        color: "text-accent bg-accent bg-opacity-10",
        icon: <CheckCircle className="w-3 h-3" />
      }
    };

    return config[status] || config["not-started"];
  };

  // ✅ Get count of courses by status
  const getStatusCount = (status) => {
    return enrolledCourses.filter(c => {
      const courseStatus = getCourseStatus(c);
      return courseStatus === status;
    }).length;
  };

  // ✅ Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (fetchCount.current > 0) {
      console.log("⏭️ Skipping duplicate fetch");
      return;
    }

    fetchCount.current += 1;

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching dashboard data...");

      const response = await axiosInstance.get("/users/enrollments");
      console.log("📦 API Response:", response.data);

      if (response.data && response.data.success) {
        let courses = [];
        if (Array.isArray(response.data.data)) {
          courses = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.courses)) {
          courses = response.data.data.courses;
        } else if (response.data.data && Array.isArray(response.data.data.enrollments)) {
          courses = response.data.data.enrollments;
        }

        console.log("📚 Courses found:", courses.length);

        if (isMounted.current) {
          // ✅ Add status to each course using the enhanced function
          const coursesWithStatus = courses.map(course => ({
            ...course,
            status: getCourseStatus(course),
            progress: course.progress || 0,
          }));

          console.log("📊 Courses with status:", coursesWithStatus.map(c => ({ 
            title: c.title, 
            progress: c.progress, 
            status: c.status 
          })));

          setEnrolledCourses(coursesWithStatus);
          setFilteredCourses(coursesWithStatus);

          // ✅ Calculate detailed stats
          const total = courses.length;
          const completed = courses.filter(c => c.progress === 100 || c.status === 'completed' || c.isCompleted === true).length;
          const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100 && c.status !== 'completed').length;
          const notStarted = courses.filter(c => c.progress === 0 && c.status !== 'completed').length;
          const totalHours = courses.reduce((sum, c) => sum + (c.totalDuration || 0), 0) / 60;
          const avgProgress = total > 0
            ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / total)
            : 0;

          console.log("📊 Stats:", { total, completed, inProgress, notStarted, avgProgress });

          setStats({
            totalCourses: total,
            completedCourses: completed,
            inProgressCourses: inProgress,
            notStartedCourses: notStarted,
            totalHours: Math.round(totalHours),
            averageProgress: avgProgress,
          });
        }
      } else {
        const errorMsg = response.data?.message || "Failed to load dashboard data";
        if (isMounted.current) {
          setError(errorMsg);
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      let errorMessage = "Failed to load dashboard data";
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.statusText || errorMessage;
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      if (isMounted.current) {
        setError(errorMessage);
        toast.error(errorMessage);
        setEnrolledCourses([]);
        setFilteredCourses([]);
        setStats({
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          notStartedCourses: 0,
          totalHours: 0,
          averageProgress: 0,
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        console.log("✅ Dashboard data fetch completed");
      }
    }
  }, [toast]);

  // ✅ Filter and sort courses
  useEffect(() => {
    let result = [...enrolledCourses];

    // ✅ Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(course => course.status === statusFilter);
    }

    // ✅ Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(course =>
        course.title?.toLowerCase().includes(term) ||
        course.category?.toLowerCase().includes(term) ||
        course.instructorName?.toLowerCase().includes(term)
      );
    }

    // ✅ Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "progress":
          comparison = (a.progress || 0) - (b.progress || 0);
          break;
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "date":
          comparison = new Date(a.enrolledAt || 0) - new Date(b.enrolledAt || 0);
          break;
        case "duration":
          comparison = (a.totalDuration || 0) - (b.totalDuration || 0);
          break;
        default:
          comparison = (a.progress || 0) - (b.progress || 0);
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredCourses(result);
  }, [enrolledCourses, statusFilter, searchTerm, sortBy, sortOrder]);

  // ✅ Run once on mount
  useEffect(() => {
    isMounted.current = true;
    fetchDashboardData();
    return () => {
      isMounted.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ Certificate Download Handler
  const handleDownloadCertificate = async (enrollmentId, courseTitle) => {
    if (!enrollmentId) {
      toast.error("Invalid enrollment ID");
      return;
    }

    setDownloadingCertificate(enrollmentId);
    const toastId = toast.loading(`Generating certificate for ${courseTitle || "course"}...`);

    try {
      const response = await axiosInstance.get(`/certificates/${enrollmentId}`, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.includes("pdf")) {
        throw new Error("Invalid certificate format");
      }

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      const fileName = `certificate_${courseTitle?.replace(/\s+/g, "_") || "course"}.pdf`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success("🎉 Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.dismiss(toastId);

      let errorMessage = "Failed to download certificate";
      if (error.response?.status === 404) {
        errorMessage = "Certificate not found. Please complete the course first.";
      } else if (error.response?.status === 401) {
        errorMessage = "You are not authorized to download this certificate.";
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
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };

  // ✅ Render course card
  const renderCourseCard = (course) => {
    // Check if course is completed (either by progress or status)
    const isCompleted = course.progress === 100 || course.status === 'completed' || course.isCompleted === true;
    const statusInfo = getStatusBadge(course.status);

    return (
      <div key={course._id || course.id} className="card hover:shadow-xl transition-all duration-300">
        <div className="flex items-start space-x-4">
          <img
            src={course.thumbnail || "https://via.placeholder.com/96x80"}
            alt={course.title || "Course"}
            className="w-24 h-20 object-cover rounded"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/96x80";
            }}
          />
          <div className="flex-1 min-w-0">
            <Link
              to={`/course/${course._id || course.id}`}
              className="font-semibold text-text hover:text-primary transition-colors duration-300 line-clamp-1"
            >
              {course.title || "Untitled Course"}
            </Link>
            <p className="text-xs text-text text-opacity-60 mt-1">
              {course.category || "General"} • {course.level || "All Levels"}
            </p>

            {/* Progress Bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text text-opacity-60">Progress</span>
                <span className={`font-semibold ${isCompleted ? 'text-accent' : 'text-primary'}`}>
                  {course.progress || 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-accent' : 'bg-primary'}`}
                  style={{ width: `${course.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center flex-wrap gap-2 mt-3">
              {/* Status Badge */}
              <span className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                {statusInfo.icon}
                <span>{statusInfo.label}</span>
              </span>

              {/* Continue Learning Button */}
              <Link
                to={`/learning/${course.enrollmentId}`}
                className="text-xs btn-primary py-1 px-3 flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>{isCompleted ? "Review" : "Continue"}</span>
              </Link>

              {/* Certificate Button (only for completed) */}
              {isCompleted && (
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
                      <span>Certificate</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Dashboard Header */}
      <section className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-background text-2xl font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-text">
                  Welcome back, {user?.name || "User"}!
                </h1>
                <p className="text-text text-opacity-60 text-sm">
                  {user?.role === "instructor" ? "Instructor" : "Student"} • {user?.email || "No email"}
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
                <p className="text-text text-opacity-60 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-text">{stats.inProgressCourses}</p>
              </div>
              <div className="w-10 h-10 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-secondary" />
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
          {["overview", "courses", "progress", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-text text-opacity-60 hover:text-primary"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Your Courses Section with Filters */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-text">Your Courses</h3>
                  <Link
                    to="/courses"
                    className="text-sm text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Quick Status Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                      statusFilter === "all"
                        ? "bg-primary text-background"
                        : "bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10"
                    }`}
                  >
                    All ({stats.totalCourses})
                  </button>
                  <button
                    onClick={() => setStatusFilter("not-started")}
                    className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                      statusFilter === "not-started"
                        ? "bg-text text-background"
                        : "bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10"
                    }`}
                  >
                    Not Started ({getStatusCount("not-started")})
                  </button>
                  <button
                    onClick={() => setStatusFilter("in-progress")}
                    className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                      statusFilter === "in-progress"
                        ? "bg-primary text-background"
                        : "bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10"
                    }`}
                  >
                    In Progress ({getStatusCount("in-progress")})
                  </button>
                  <button
                    onClick={() => setStatusFilter("completed")}
                    className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                      statusFilter === "completed"
                        ? "bg-accent text-background"
                        : "bg-background text-text text-opacity-60 hover:bg-primary hover:bg-opacity-10"
                    }`}
                  >
                    Completed ({getStatusCount("completed")})
                  </button>
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-text text-opacity-20 mx-auto mb-3" />
                    <p className="text-text text-opacity-60">
                      {searchTerm ? "No courses match your search" : "You haven't enrolled in any courses yet."}
                    </p>
                    <Link to="/courses" className="btn-primary inline-block mt-4">
                      Explore Courses
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCourses.slice(0, 3).map(renderCourseCard)}
                    {filteredCourses.length > 3 && (
                      <div className="text-center">
                        <button
                          onClick={() => setActiveTab("courses")}
                          className="text-sm text-primary hover:text-secondary transition-colors duration-300"
                        >
                          View all {filteredCourses.length} courses →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <ProgressCharts enrolledCourses={enrolledCourses} stats={stats} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="card">
                <h4 className="font-semibold text-text mb-3">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text text-opacity-60">Not Started</span>
                    <span className="text-text">{stats.notStartedCourses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text text-opacity-60">In Progress</span>
                    <span className="text-text">{stats.inProgressCourses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text text-opacity-60">Completed</span>
                    <span className="text-text">{stats.completedCourses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text text-opacity-60">Certificates</span>
                    <span className="text-text">{stats.completedCourses}</span>
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
                    onClick={() => setActiveTab("profile")}
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
        {activeTab === "courses" && (
          <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-semibold text-text">
                All Enrolled Courses ({filteredCourses.length})
              </h3>
            </div>

            {/* Search and Filters */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text text-opacity-40" />
                  <input
                    type="text"
                    placeholder="Search your courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-card text-text placeholder-text placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text text-opacity-40 hover:text-primary transition-colors duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-2 bg-background border border-border rounded-card text-text hover:border-primary transition-colors duration-300 flex items-center space-x-2 text-sm"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All</option>
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="progress">Progress</option>
                      <option value="title">Title</option>
                      <option value="date">Enrollment Date</option>
                      <option value="duration">Duration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Sort Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Course Grid */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-text mb-2">
                  {searchTerm ? "No courses match your search" : "No courses yet"}
                </h4>
                <p className="text-text text-opacity-60">
                  {searchTerm ? "Try adjusting your search or filters" : "Start your learning journey by enrolling in a course."}
                </p>
                <Link to="/courses" className="btn-primary inline-block mt-4">
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCourses.map(renderCourseCard)}
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div>
            <h3 className="text-xl font-semibold text-text mb-6">Learning Progress</h3>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
                <p className="text-text text-opacity-60">No progress data available.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {enrolledCourses.map((course) => {
                  const isCompleted = course.progress === 100 || course.status === 'completed';
                  return (
                    <div key={course._id || course.id} className="card">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/course/${course._id || course.id}`}
                            className="font-semibold text-text hover:text-primary transition-colors duration-300"
                          >
                            {course.title || "Untitled Course"}
                          </Link>
                          <p className="text-sm text-text text-opacity-60">
                            {course.moduleCount || 0} modules • {Math.round((course.totalDuration || 0) / 60)} hours
                          </p>
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(course.status).color}`}>
                              {getStatusBadge(course.status).label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3 md:mt-0">
                          <div className="text-right">
                            <div className={`text-sm font-semibold ${isCompleted ? 'text-accent' : 'text-primary'}`}>
                              {course.progress || 0}%
                            </div>
                            <div className="w-32 h-2 bg-background rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-accent' : 'bg-primary'}`}
                                style={{ width: `${course.progress || 0}%` }}
                              />
                            </div>
                          </div>
                          {isCompleted ? (
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
                            <Link
                              to={`/learning/${course.enrollmentId}`}
                              className="btn-primary text-sm py-1.5 px-4 flex items-center space-x-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Continue</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && <ProfileSettings />}
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;