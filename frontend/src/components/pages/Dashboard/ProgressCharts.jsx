import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

const ProgressCharts = ({ enrolledCourses, stats }) => {
  // Course Progress Distribution (Doughnut Chart)
  const progressData = {
    labels: ['Not Started', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [
          enrolledCourses.filter(c => c.progress === 0).length,
          enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length,
          enrolledCourses.filter(c => c.progress === 100).length,
        ],
        backgroundColor: ['#6D5F60', '#8AA39B', '#E07A5F'],
        borderColor: ['#4A3F40', '#4A3F40', '#4A3F40'],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#DBE2DC',
          padding: 20,
          font: { size: 12 },
        },
      },
    },
    cutout: '70%',
  };

  // Category Distribution (Bar Chart)
  const categoryCount = {};
  enrolledCourses.forEach(course => {
    categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
  });


  if (enrolledCourses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text text-opacity-60">
          Enroll in courses to see your progress charts
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Doughnut Chart - Progress Distribution */}
      <div className="card">
        <h4 className="font-semibold text-text mb-4">Course Progress</h4>
        <div className="max-w-xs mx-auto">
          <Doughnut data={progressData} options={doughnutOptions} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-text text-opacity-60">Not Started</div>
            <div className="font-semibold text-text">
              {enrolledCourses.filter(c => c.progress === 0).length}
            </div>
          </div>
          <div>
            <div className="text-text text-opacity-60">In Progress</div>
            <div className="font-semibold text-text">
              {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length}
            </div>
          </div>
          <div>
            <div className="text-text text-opacity-60">Completed</div>
            <div className="font-semibold text-text">
              {enrolledCourses.filter(c => c.progress === 100).length}
            </div>
          </div>
        </div>
      </div>

    
   
    </div>
  );
};

export default ProgressCharts;