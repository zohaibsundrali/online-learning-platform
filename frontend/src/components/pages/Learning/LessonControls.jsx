import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Award,
 
  Lock
} from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';

const LessonControls = ({
  // Navigation
  onPrevious,
  onNext,
  isFirstModule,
  isLastModule,
  
  // Completion
  onMarkComplete,
  isCompleted,
  isCompleting,
  
  // Status
  isLocked,
  isLastModuleOfCourse,
  isCourseCompleted,
  
  // Course info
  courseId,
  enrollmentId,
  
  // ✅ New: Certificate download handler
  onDownloadCertificate,
  isDownloadingCertificate,
  
  className = '',
}) => {
  // Render different button states
  const renderMainAction = () => {
    // If course is completed, show "Get Certificate" button with download handler
    if (isCourseCompleted) {
      return (
        <button
          onClick={onDownloadCertificate}
          disabled={isDownloadingCertificate}
          className="btn-primary flex items-center space-x-2 bg-accent hover:bg-accent hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloadingCertificate ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Award className="w-4 h-4" />
              <span>Get Certificate</span>
            </>
          )}
        </button>
      );
    }

    // If module is locked (for future paid content)
    if (isLocked) {
      return (
        <button
          disabled
          className="btn-secondary opacity-50 cursor-not-allowed flex items-center space-x-2"
        >
          <Lock className="w-4 h-4" />
          <span>Locked</span>
        </button>
      );
    }

    // If module is completed, show "Next Lesson" or "Course Completed"
    if (isCompleted) {
      if (isLastModuleOfCourse) {
        return (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-accent font-medium">
              ✅ All modules completed!
            </span>
            <button
              onClick={onDownloadCertificate}
              disabled={isDownloadingCertificate}
              className="btn-primary flex items-center space-x-2 bg-accent hover:bg-accent hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloadingCertificate ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Get Certificate</span>
                </>
              )}
            </button>
          </div>
        );
      }
      
      return (
        <button
          onClick={onNext}
          className="btn-primary flex items-center space-x-2"
        >
          <span>Next Lesson</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      );
    }

    // Default: Show "Mark as Completed" button
    return (
      <button
        onClick={onMarkComplete}
        disabled={isCompleting}
        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCompleting ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Marking...</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>Mark as Completed</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={isFirstModule || isLocked}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-card 
          transition-all duration-300
          ${isFirstModule || isLocked 
            ? 'opacity-30 cursor-not-allowed bg-card border border-border text-text' 
            : 'bg-card border border-border text-text hover:border-primary hover:text-primary'
          }
        `}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Main Action (Center) */}
      <div className="flex-1 flex justify-center">
        {renderMainAction()}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={isLastModule || isLocked || (!isCompleted && !isCourseCompleted)}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-card 
          transition-all duration-300
          ${isLastModule || isLocked || (!isCompleted && !isCourseCompleted)
            ? 'opacity-30 cursor-not-allowed bg-card border border-border text-text' 
            : 'bg-card border border-border text-text hover:border-primary hover:text-primary'
          }
        `}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LessonControls;