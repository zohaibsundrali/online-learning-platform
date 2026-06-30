import React from 'react';
import { BookOpen, Users, DollarSign, Globe } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: stats?.totalCourses || 0,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
    },
    {
      icon: Users,
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      color: 'text-secondary',
      bgColor: 'bg-secondary bg-opacity-10',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      color: 'text-accent',
      bgColor: 'bg-accent bg-opacity-10',
    },
    {
      icon: Globe,
      label: 'Published',
      value: `${stats?.publishedCourses || 0}/${stats?.totalCourses || 0}`,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text text-opacity-60 text-sm">{card.label}</p>
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
  );
};

export default StatsCards;