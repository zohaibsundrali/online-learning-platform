import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  
  Menu,
  X,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/ToastProvider';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import axiosInstance from '../../../api/axios';

// Import sub-components
import ModuleSidebar from './ModuleSidebar';
import VideoPlayer from './VideoPlayer';
import CourseProgress from './CourseProgress';
import LessonControls from './LessonControls';

const LearningPage = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [learningData, setLearningData] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  const videoRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch learning data
  useEffect(() => {
    fetchLearningData();
  }, [enrollmentId]);

  const fetchLearningData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/learning/${enrollmentId}`);
      if (response.data.success) {
        const data = response.data.data;
        setLearningData(data);
        setModules(data.modules);
        setProgress(data.enrollment.progress);
        setIsCourseCompleted(data.enrollment.status === 'completed');
        
        // Set current module
        if (data.currentModule) {
          setCurrentModule(data.currentModule);
          setCurrentIndex(data.currentModuleIndex);
        } else if (data.modules.length > 0) {
          setCurrentModule(data.modules[0]);
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
      toast.error('Failed to load course content');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module, index) => {
    setCurrentModule(module);
    setCurrentIndex(index);
    updatePosition(module._id);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const updatePosition = async (moduleId) => {
    try {
      await axiosInstance.put(`/learning/${enrollmentId}/position`, {
        moduleId,
      });
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentModule) return;
    if (completing) return;
    if (currentModule.isCompleted) {
      toast.info('This module is already completed');
      return;
    }

    setCompleting(true);
    const toastId = toast.loading('Marking as completed...');

    try {
      const response = await axiosInstance.put(
        `/learning/${enrollmentId}/module/${currentModule._id}/complete`
      );

      if (response.data.success) {
        const data = response.data.data;
        
        setProgress(data.progress);
        setIsCourseCompleted(data.isCompleted);
        
        const updatedModules = modules.map((m, idx) => {
          if (idx === currentIndex) {
            return { ...m, isCompleted: true };
          }
          return m;
        });
        setModules(updatedModules);
        setCurrentModule({ ...currentModule, isCompleted: true });

        if (data.isCompleted) {
          toast.success('🎉 Course completed! You\'ve earned a certificate!');
        } else {
          toast.success(`Progress updated: ${data.progress}%`);
        }

        if (data.nextModule && !data.isCompleted) {
          const nextIndex = updatedModules.findIndex(
            m => m._id.toString() === data.nextModule._id.toString()
          );
          if (nextIndex !== -1) {
            setTimeout(() => {
              handleModuleSelect(updatedModules[nextIndex], nextIndex);
            }, 1500);
          }
        }
      }
    } catch (error) {
      console.error('Error marking module complete:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as completed');
    } finally {
      toast.dismiss(toastId);
      setCompleting(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevModule = modules[currentIndex - 1];
      handleModuleSelect(prevModule, currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < modules.length - 1) {
      const nextModule = modules[currentIndex + 1];
      handleModuleSelect(nextModule, currentIndex + 1);
    }
  };

  // ✅ Certificate Download Handler - Same as Dashboard
  const handleDownloadCertificate = async () => {
    if (!enrollmentId) {
      toast.error("Invalid enrollment ID");
      return;
    }

    setDownloadingCertificate(true);
    const toastId = toast.loading('Generating certificate...');

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
      const fileName = `certificate_${learningData?.course?.title?.replace(/\s+/g, "_") || "course"}.pdf`;
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
      setDownloadingCertificate(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!learningData || !currentModule) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text">No Content Available</h2>
          <p className="text-text text-opacity-60 mt-2">
            This course doesn't have any modules yet.
          </p>
          <Link to="/dashboard" className="btn-primary inline-block mt-6">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = currentModule.isCompleted;
  const isLastModule = currentIndex === modules.length - 1;
  const isFirstModule = currentIndex === 0;
  // const allCompleted = modules.every(m => m.isCompleted);
  const completedCount = modules.filter(m => m.isCompleted).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-text hover:text-primary transition-colors duration-300"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-text hover:text-primary transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-text text-opacity-60 hidden sm:inline">
              {progress}% complete
            </span>
            <div className="w-24 sm:w-32 h-2 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCourseCompleted ? 'bg-accent' : 'bg-primary'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-text text-opacity-60">
              {currentIndex + 1}/{modules.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isMobile ? 'fixed inset-y-0 left-0 z-30 w-72' : 'relative w-80 flex-shrink-0'}
            bg-card border-r border-border transition-transform duration-300 ease-in-out
            overflow-y-auto
          `}
        >
          <div className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold text-text text-sm mb-1 line-clamp-2">
                {learningData.course.title}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-text text-opacity-60">
                <span>{learningData.course.level}</span>
                <span>•</span>
                <span>{learningData.modules.length} modules</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <ModuleSidebar
                modules={modules}
                currentModuleId={currentModule._id}
                onSelect={handleModuleSelect}
                completedCount={completedCount}
                totalCount={modules.length}
                isCourseCompleted={isCourseCompleted}
              />
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={toggleSidebar}
          />
        )}

        {/* Video Player Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {/* Video Player */}
            <div className="bg-card rounded-card border border-border overflow-hidden shadow-lg">
              <VideoPlayer
                ref={videoRef}
                videoUrl={currentModule.videoUrl}
                title={currentModule.title}
              />
            </div>

            {/* Module Info */}
            <div className="mt-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-text">
                    {currentModule.title}
                  </h1>
                  <p className="text-text text-opacity-60 text-sm mt-1">
                    {currentModule.duration} minutes • {currentModule.isFree ? 'Free Preview' : 'Premium'}
                  </p>
                </div>
                {isCompleted && (
                  <span className="flex items-center space-x-1 text-accent text-sm font-semibold">
                    ✓ Completed
                  </span>
                )}
              </div>

              <p className="text-text text-opacity-80">
                {currentModule.description}
              </p>

              {/* Resources */}
              {currentModule.resources && currentModule.resources.length > 0 && (
                <div className="bg-background rounded-card p-4">
                  <h4 className="text-sm font-semibold text-text mb-2">Resources</h4>
                  <ul className="space-y-2">
                    {currentModule.resources.map((resource, index) => (
                      <li key={index}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-2"
                        >
                          <span>📄</span>
                          <span>{resource.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Course Progress */}
              <CourseProgress
                progress={progress}
                completedCount={completedCount}
                totalModules={modules.length}
                isCompleted={isCourseCompleted}
                completionDate={learningData.enrollment.completionDate}
              />

              {/* Lesson Controls - with certificate download handler */}
              <LessonControls
                onPrevious={handlePrevious}
                onNext={handleNext}
                isFirstModule={isFirstModule}
                isLastModule={isLastModule}
                onMarkComplete={handleMarkComplete}
                isCompleted={isCompleted}
                isCompleting={completing}
                isLocked={false}
                isLastModuleOfCourse={isLastModule && isCompleted}
                isCourseCompleted={isCourseCompleted}
                courseId={learningData.course.id}
                enrollmentId={enrollmentId}
                onDownloadCertificate={handleDownloadCertificate}
                isDownloadingCertificate={downloadingCertificate}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningPage;