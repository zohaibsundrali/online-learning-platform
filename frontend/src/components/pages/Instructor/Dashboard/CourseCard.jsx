import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, EyeOff, Trash2, Users, Clock, Play, BarChart3 } from 'lucide-react';

const CourseCard = ({ course, onPublish, onDelete }) => {
  const moduleCount = course.modules?.length || 0;
  const totalDuration = course.totalDuration || 0;
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const durationString = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    : `${minutes}m`;

  return (
    <div className="card hover:shadow-xl transition-all duration-300">
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        <img
          src={course.thumbnail || 'https://via.placeholder.com/120x80'}
          alt={course.title}
          className="w-32 h-24 object-cover rounded"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/120x80';
          }}
        />

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <Link
                to={`/instructor/course/${course._id}/edit`}
                className="font-semibold text-text hover:text-primary transition-colors duration-300 line-clamp-1"
              >
                {course.title}
              </Link>
              <p className="text-xs text-text text-opacity-60 mt-1 line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Status Badge */}
            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
              course.isPublished 
                ? 'bg-accent bg-opacity-10 text-accent' 
                : 'bg-text bg-opacity-10 text-text text-opacity-60'
            }`}>
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-text text-opacity-60 mt-2">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{durationString}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Play className="w-3 h-3" />
              <span>{moduleCount} modules</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{course.studentsEnrolled || 0} students</span>
            </span>
            <span>•</span>
            <span>{course.category}</span>
            <span>•</span>
            <span>{course.level}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 mt-3">
            <Link
              to={`/instructor/course/${course._id}/edit`}
              className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
              title="Edit Course"
            >
              <Edit className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
            </Link>

            <Link
              to={`/instructor/course/${course._id}/analytics`}
              className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
              title="View Analytics"
            >
              <BarChart3 className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
            </Link>

            <button
              onClick={() => onPublish(course._id)}
              className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
              title={course.isPublished ? 'Unpublish Course' : 'Publish Course'}
            >
              {course.isPublished ? (
                <EyeOff className="w-4 h-4 text-text hover:text-accent transition-colors duration-300" />
              ) : (
                <Eye className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
              )}
            </button>

            <button
              onClick={() => onDelete(course._id)}
              className="p-1.5 hover:bg-accent hover:bg-opacity-10 rounded-lg transition-colors duration-300"
              title="Delete Course"
            >
              <Trash2 className="w-4 h-4 text-text hover:text-accent transition-colors duration-300" />
            </button>

            <Link
              to={`/course/${course._id}`}
              target="_blank"
              className="ml-auto text-xs text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1"
            >
              <span>View Course</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;