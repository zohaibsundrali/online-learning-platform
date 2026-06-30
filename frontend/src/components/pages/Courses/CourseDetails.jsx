import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Play,
  CheckCircle,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  AlertCircle,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/ToastProvider';
import Navbar from '../../layout/Navbar/Navbar';
import Footer from '../../layout/Footer/Footer';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import axiosInstance from '../../../api/axios';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/courses/${id}`);
      if (response.data.success) {
        setCourse(response.data.data);
        setIsEnrolled(response.data.isEnrolled || false);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };
// Update the handleEnroll function
// Update the handleEnroll function
const handleEnroll = async () => {
  if (!user) {
    toast.error('Please login to enroll in this course');
    navigate('/login');
    return;
  }

  setEnrolling(true);
  const toastId = toast.loading('Enrolling in course...');

  try {
    const response = await axiosInstance.post(`/courses/${id}/enroll`);
    if (response.data.success) {
      setIsEnrolled(true);
      
      const enrollmentId = response.data.data?.enrollmentId;
      const courseTitle = response.data.data?.courseTitle || course?.title;
      
      toast.success(`Successfully enrolled in "${courseTitle}"! 🎉`);
      
      // Update the course students count
      setCourse(prev => ({
        ...prev,
        studentsEnrolled: (prev.studentsEnrolled || 0) + 1,
      }));

      // Redirect to learning page or dashboard
      setTimeout(() => {
        if (enrollmentId) {
          navigate(`/learning/${enrollmentId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    }
  } catch (error) {
    console.error('Error enrolling:', error);
    const errorMessage = error.response?.data?.message || 'Failed to enroll in course';
    toast.error(errorMessage);
  } finally {
    toast.dismiss(toastId);
    setEnrolling(false);
  }
};

  const toggleModule = (index) => {
    setExpandedModules(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

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

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text">Course Not Found</h2>
          <p className="text-text text-opacity-60 mt-2">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="btn-primary inline-block mt-6">
            Browse Courses
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const totalModules = course.modules?.length || 0;
  const totalDuration = course.totalDuration || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 text-sm text-text text-opacity-60 mb-4">
                <span className="px-3 py-1 bg-primary bg-opacity-10 rounded-full text-primary">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-card border border-border rounded-full">
                  {course.level}
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
                {course.title}
              </h1>

              <p className="text-text text-opacity-80 text-lg mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-text text-opacity-60">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>By {course.instructorName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span>{course.rating?.toFixed(1) || '0'} ({course.totalReviews || 0} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{course.studentsEnrolled || 0} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(totalDuration)} total</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card">
                <div className="aspect-video bg-gradient-to-br from-primary to-secondary rounded-lg mb-4 flex items-center justify-center">
                  <Play className="w-16 h-16 text-background opacity-50" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-primary">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </span>
                  {isEnrolled && (
                    <span className="px-3 py-1 bg-primary text-background rounded-full text-sm font-semibold">
                      Enrolled
                    </span>
                  )}
                </div>

                {isEnrolled ? (
                  <Link
                    to={`/course/${course._id}/learn`}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Continue Learning</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Enroll Now</span>
                      </>
                    )}
                  </button>
                )}

                <div className="mt-4 text-xs text-text text-opacity-40 text-center">
                  {course.price === 0 ? 'Free course. Enroll and start learning!' : 'One-time payment. Lifetime access.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex border-b border-border mb-8">
            {['overview', 'curriculum', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors duration-300 ${
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
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* What You'll Learn */}
                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                  <div className="card">
                    <h3 className="text-xl font-semibold text-text mb-4 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span>What You'll Learn</span>
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.whatYouWillLearn.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-text text-opacity-80 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prerequisites */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="card">
                    <h3 className="text-xl font-semibold text-text mb-4 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-secondary" />
                      <span>Prerequisites</span>
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index} className="text-text text-opacity-80 text-sm">
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instructor Info */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-text mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>Instructor</span>
                  </h3>
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-background text-xl font-bold">
                      {course.instructorName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-text">{course.instructorName}</h4>
                      {course.instructorBio && (
                        <p className="text-sm text-text text-opacity-60 mt-1">
                          {course.instructorBio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4">
                <div className="card">
                  <h4 className="font-semibold text-text mb-3">Course Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text text-opacity-60">Category</span>
                      <span className="text-text">{course.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text text-opacity-60">Level</span>
                      <span className="text-text">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text text-opacity-60">Modules</span>
                      <span className="text-text">{totalModules}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text text-opacity-60">Total Duration</span>
                      <span className="text-text">{formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text text-opacity-60">Students</span>
                      <span className="text-text">{course.studentsEnrolled || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h4 className="font-semibold text-text mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-background border border-border rounded-full text-xs text-text text-opacity-60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Curriculum Tab */}
          {activeTab === 'curriculum' && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-text font-semibold">{totalModules} modules</span>
                  <span className="text-text text-opacity-40 mx-2">•</span>
                  <span className="text-text text-opacity-60">{formatDuration(totalDuration)} total</span>
                </div>
                {isEnrolled && (
                  <span className="text-sm text-primary">✓ Enrolled</span>
                )}
              </div>

              <div className="space-y-4">
                {course.modules?.map((module, index) => {
                  const isExpanded = expandedModules.includes(index);
                  const isLocked = !isEnrolled && !module.isFree;

                  return (
                    <div key={index} className="card">
                      <button
                        onClick={() => toggleModule(index)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-text flex items-center space-x-2">
                              <span>{module.title}</span>
                              {isLocked && <Lock className="w-4 h-4 text-text text-opacity-40" />}
                              {!isLocked && isEnrolled && module.isFree && (
                                <Unlock className="w-4 h-4 text-primary" />
                              )}
                            </h4>
                            <p className="text-sm text-text text-opacity-60">
                              {module.duration}m • {module.isFree ? 'Free preview' : 'Premium'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {isEnrolled && !isLocked && (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-text text-opacity-40" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text text-opacity-40" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-text text-opacity-80 text-sm mb-4">
                            {module.description}
                          </p>
                          {isLocked ? (
                            <div className="bg-background rounded-card p-4 text-center text-text text-opacity-60 text-sm">
                              <Lock className="w-5 h-5 mx-auto mb-2" />
                              Enroll to access this module
                            </div>
                          ) : (
                            <button className="flex items-center space-x-2 text-primary hover:text-secondary transition-colors duration-300">
                              <Play className="w-4 h-4" />
                              <span className="text-sm">Watch Preview</span>
                            </button>
                          )}
                          {module.resources && module.resources.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-text text-opacity-60 mb-2">Resources:</p>
                              <ul className="space-y-1">
                                {module.resources.map((resource, idx) => (
                                  <li key={idx} className="flex items-center space-x-2 text-sm">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <a href={resource.url} className="text-primary hover:text-secondary transition-colors duration-300">
                                      {resource.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isEnrolled && (
                <div className="mt-8 text-center p-6 bg-card border border-border rounded-card">
                  <p className="text-text text-opacity-60 mb-4">
                    Enroll to access all course materials
                  </p>
                  <button
                    onClick={handleEnroll}
                    className="btn-primary"
                    disabled={enrolling}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-text">Student Reviews</h3>
                    <p className="text-text text-opacity-60 text-sm mt-1">
                      {course.totalReviews || 0} reviews
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-6 h-6 text-accent fill-accent" />
                    <span className="text-2xl font-bold text-text">{course.rating?.toFixed(1) || '0'}</span>
                  </div>
                </div>

                {course.totalReviews === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text text-opacity-60">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Reviews will be populated here */}
                    <div className="text-center py-8">
                      <p className="text-text text-opacity-60">Reviews coming soon!</p>
                    </div>
                  </div>
                )}

                {isEnrolled && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <button className="text-primary hover:text-secondary transition-colors duration-300">
                      Write a Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetails;