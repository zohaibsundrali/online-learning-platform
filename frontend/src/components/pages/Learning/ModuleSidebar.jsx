import React from 'react';
import { CheckCircle, Circle, Play, Lock } from 'lucide-react';

const ModuleSidebar = ({
  modules,
  currentModuleId,
  onSelect,
  completedCount,
  totalCount,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">Course Content</h3>
        <span className="text-xs text-text text-opacity-60">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      <div className="space-y-1">
        {modules.map((module, index) => {
          const isCurrent = module._id === currentModuleId;
          const isCompleted = module.isCompleted;
          const isLocked = module.isLocked;

          return (
            <button
              key={module._id}
              onClick={() => onSelect(module, index)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                transition-all duration-300 text-left
                ${isCurrent ? 'bg-primary bg-opacity-10 border border-primary' : 'hover:bg-primary hover:bg-opacity-5'}
                ${isCompleted ? 'text-text' : 'text-text text-opacity-80'}
                ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={isLocked}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-accent" />
                ) : isCurrent ? (
                  <Play className="w-4 h-4 text-primary" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4 text-text text-opacity-30" />
                ) : (
                  <Circle className="w-4 h-4 text-text text-opacity-30" />
                )}
              </div>

              {/* Module Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm truncate ${isCurrent ? 'font-semibold text-primary' : ''}`}>
                    {module.title}
                  </span>
                  <span className="text-xs text-text text-opacity-40 flex-shrink-0 ml-2">
                    {module.duration}m
                  </span>
                </div>
                {isCurrent && (
                  <div className="text-xs text-primary mt-0.5">Current</div>
                )}
              </div>

              {/* Order number */}
              <span className="text-xs text-text text-opacity-20 flex-shrink-0">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Completion Summary */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="mt-4 p-3 bg-accent bg-opacity-10 border border-accent border-opacity-20 rounded-lg">
          <div className="flex items-center space-x-2 text-accent">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Course Completed! 🎉</span>
          </div>
          <p className="text-xs text-accent text-opacity-70 mt-1">
            You've completed all modules in this course.
          </p>
        </div>
      )}
    </div>
  );
};

export default ModuleSidebar;