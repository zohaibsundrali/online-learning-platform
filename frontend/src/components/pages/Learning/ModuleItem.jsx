import React, { memo } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Play, 
  Lock, 
  Clock,
  FileText,
  Video
} from 'lucide-react';

const ModuleItem = memo(({
  module,
  index,
  isCurrent,
  isCompleted,
  isLocked = false,
  onSelect,
  className = '',
}) => {
  // Handle click
  const handleClick = () => {
    if (!isLocked && onSelect) {
      onSelect(module, index);
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isCompleted) {
      return (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-accent" />
        </div>
      );
    }
    
    if (isCurrent) {
      return (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary bg-opacity-10 flex items-center justify-center animate-pulse">
          <Play className="w-4 h-4 text-primary" />
        </div>
      );
    }
    
    if (isLocked) {
      return (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
          <Lock className="w-4 h-4 text-text text-opacity-30" />
        </div>
      );
    }
    
    return (
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
        <Circle className="w-4 h-4 text-text text-opacity-20" />
      </div>
    );
  };

  // Get status text
  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isCurrent) return 'Current';
    if (isLocked) return 'Locked';
    return '';
  };

  // Get status color
  const getStatusColor = () => {
    if (isCompleted) return 'text-accent';
    if (isCurrent) return 'text-primary';
    if (isLocked) return 'text-text text-opacity-30';
    return 'text-text text-opacity-40';
  };

  // Get background color
  const getBgColor = () => {
    if (isCurrent) return 'bg-primary bg-opacity-10 border border-primary';
    if (isCompleted) return 'hover:bg-primary hover:bg-opacity-5';
    return 'hover:bg-primary hover:bg-opacity-5';
  };

  // Get cursor style
  const getCursor = () => {
    if (isLocked) return 'cursor-not-allowed';
    return 'cursor-pointer';
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLocked}
      className={`
        w-full flex items-start space-x-3 px-3 py-3 rounded-lg
        transition-all duration-300 text-left
        ${getBgColor()}
        ${getCursor()}
        ${isLocked ? 'opacity-60' : ''}
        ${className}
      `}
    >
      {/* Order Number and Status Icon */}
      <div className="flex flex-col items-center space-y-1">
        <span className="text-xs text-text text-opacity-20 font-medium">
          {index + 1}
        </span>
        {getStatusIcon()}
      </div>

      {/* Module Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`
                text-sm font-medium truncate
                ${isCurrent ? 'text-primary' : ''}
                ${isCompleted ? 'text-text' : ''}
                ${isLocked ? 'text-text text-opacity-40' : 'text-text'}
              `}>
                {module.title || `Module ${index + 1}`}
              </span>
              {isCurrent && (
                <span className="text-xs text-primary font-medium">●</span>
              )}
            </div>
            
            {/* Module Metadata */}
            <div className="flex items-center space-x-3 mt-1">
              {/* Duration */}
              {module.duration && (
                <span className="flex items-center space-x-1 text-xs text-text text-opacity-40">
                  <Clock className="w-3 h-3" />
                  <span>{module.duration}m</span>
                </span>
              )}
              
              {/* Free/Paid Badge */}
              {module.isFree && (
                <span className="text-xs text-primary bg-primary bg-opacity-10 px-2 py-0.5 rounded-full">
                  Free
                </span>
              )}
              
              {/* Status Text */}
              {getStatusText() && (
                <span className={`text-xs ${getStatusColor()}`}>
                  • {getStatusText()}
                </span>
              )}
            </div>
          </div>

          {/* Resource Indicator */}
          {module.resources && module.resources.length > 0 && (
            <div className="flex-shrink-0 ml-2">
              <FileText className="w-3 h-3 text-text text-opacity-30" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
});

ModuleItem.displayName = 'ModuleItem';

export default ModuleItem;