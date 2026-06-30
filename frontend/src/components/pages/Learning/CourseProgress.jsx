import React from 'react';
import {  Clock, Play, Award } from 'lucide-react';

const CourseProgress = ({ 
  progress, 
  completedCount, 
  totalModules,
  isCompleted,
  completionDate,
  className = '' 
}) => {
  // Calculate progress percentage for display
  const displayProgress = Math.round(progress || 0);
  
  // Format completion date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status message
  const getStatusMessage = () => {
    if (isCompleted) {
      return {
        icon: <Award className="w-5 h-5 text-accent" />,
        text: 'Course Completed! 🎉',
        color: 'text-accent',
        bgColor: 'bg-accent bg-opacity-10',
      };
    }
    if (displayProgress === 0) {
      return {
        icon: <Clock className="w-5 h-5 text-text text-opacity-40" />,
        text: 'Not Started Yet',
        color: 'text-text text-opacity-40',
        bgColor: 'bg-background',
      };
    }
    return {
      icon: <Play className="w-5 h-5 text-primary" />,
      text: 'In Progress',
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
    };
  };

  const status = getStatusMessage();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-text">Course Progress </span>
            <span className={`text-sm font-bold ${isCompleted ? 'text-accent' : 'text-primary'}`}>
              {displayProgress}%
            </span>
          </div>
          <span className="text-xs text-text text-opacity-40">
            {completedCount || 0} / {totalModules || 0} modules
          </span>
        </div>
        
        {/* Progress Bar Visual */}
        <div className="relative w-full h-2.5 bg-background rounded-full overflow-hidden border border-border">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-in-out ${
              isCompleted ? 'bg-accent' : 'bg-primary'
            }`}
            style={{ width: `${displayProgress}%` }}
          />
          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-accent opacity-20 animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${status.bgColor} ${status.color}`}>
            {status.icon}
            <span>{status.text}</span>
          </div>
          
          {isCompleted && completionDate && (
            <span className="text-xs text-text text-opacity-40">
              Completed on {formatDate(completionDate)}
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="bg-background rounded-card p-2 text-center">
          <div className="text-xs text-text text-opacity-40">Completed</div>
          <div className="text-sm font-semibold text-text">
            {completedCount || 0}
          </div>
        </div>
        <div className="bg-background rounded-card p-2 text-center">
          <div className="text-xs text-text text-opacity-40">Remaining</div>
          <div className="text-sm font-semibold text-text">
            {(totalModules || 0) - (completedCount || 0)}
          </div>
        </div>
        <div className="bg-background rounded-card p-2 text-center">
          <div className="text-xs text-text text-opacity-40">Total</div>
          <div className="text-sm font-semibold text-text">
            {totalModules || 0}
          </div>
        </div>
      </div>

      {/* Completion Celebration (when course is completed) */}
      {isCompleted && (
        <div className="p-3 bg-accent bg-opacity-10 border border-accent border-opacity-20 rounded-card animate-pulse">
          <div className="flex items-center space-x-2 text-accent">
            <Award className="w-5 h-5" />
            <span className="font-semibold text-sm">🎉 Congratulations! You've completed this course!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;