import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Clock } from 'lucide-react';

const CourseCard = ({ course }) => {
  const { _id, title, description, thumbnail, category, level, rating, studentsEnrolled, price, instructor, totalDuration } = course;

  // Calculate duration in hours and minutes
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const durationString = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    : `${minutes}m`;

  return (
    <Link to={`/course/${_id}`} className="block group">
      <div className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        {/* Thumbnail */}
        <div className="relative -mt-6 -mx-6 mb-4 overflow-hidden rounded-t-card">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 px-3 py-1 bg-card bg-opacity-90 backdrop-blur-sm border border-border rounded-full text-xs text-text">
            {level}
          </div>
          {price === 0 && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-accent text-background rounded-full text-xs font-semibold">
              FREE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-text text-opacity-60">
            <span className="px-2 py-1 bg-primary bg-opacity-10 rounded-full text-primary">
              {category}
            </span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{durationString}</span>
            </div>
          </div>

          <h3 className="font-semibold text-lg text-text group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-text text-opacity-60 line-clamp-2">
            {description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-semibold text-text">
                  {rating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-text text-opacity-40">
                <Users className="w-4 h-4" />
                <span className="text-xs">{studentsEnrolled}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary">
                {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center space-x-2 pt-3 border-t border-border">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-xs font-semibold">
              {instructor?.name?.charAt(0) || '?'}
            </div>
            <span className="text-xs text-text text-opacity-60">
              {instructor?.name || 'Unknown Instructor'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;