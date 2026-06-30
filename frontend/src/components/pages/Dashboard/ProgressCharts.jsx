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

  // const barData = {
  //   labels: Object.keys(categoryCount),
  //   datasets: [
  //     {
  //       label: 'Courses by Category',
  //       data: Object.values(categoryCount),
  //       backgroundColor: '#8AA39B',
  //       borderColor: '#4A3F40',
  //       borderWidth: 1,
  //       borderRadius: 4,
  //     },
  //   ],
  // };

  // const barOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       display: false,
  //     },
  //   },
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       ticks: {
  //         color: '#DBE2DC',
  //         stepSize: 1,
  //       },
  //       grid: {
  //         color: '#6D5F60',
  //         drawBorder: false,
  //       },
  //     },
  //     x: {
  //       ticks: {
  //         color: '#DBE2DC',
  //         maxRotation: 45,
  //         minRotation: 45,
  //       },
  //       grid: {
  //         display: false,
  //       },
  //     },
  //   },
  // };

  // Learning Progress Timeline (Line Chart)
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const progressTimeline = enrolledCourses.reduce((acc, course) => {
    // Simulate progress over time (in a real app, this would come from actual data)
    const progress = course.progress || 0;
    return acc.map((val, i) => val + Math.min(progress * 0.15, 20));
  }, [0, 0, 0, 0, 0, 0, 0]);

  // const lineData = {
  //   labels: weekLabels,
  //   datasets: [
  //     {
  //       label: 'Learning Progress',
  //       data: progressTimeline,
  //       borderColor: '#8AA39B',
  //       backgroundColor: 'rgba(138, 163, 155, 0.1)',
  //       fill: true,
  //       tension: 0.4,
  //       pointBackgroundColor: '#E07A5F',
  //       pointBorderColor: '#4A3F40',
  //       pointBorderWidth: 2,
  //       pointRadius: 4,
  //     },
  //   ],
  // };

  // const lineOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       labels: {
  //         color: '#DBE2DC',
  //         font: { size: 12 },
  //       },
  //     },
  //   },
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       max: 100,
  //       ticks: {
  //         color: '#DBE2DC',
  //         callback: (value) => `${value}%`,
  //       },
  //       grid: {
  //         color: '#6D5F60',
  //         drawBorder: false,
  //       },
  //     },
  //     x: {
  //       ticks: {
  //         color: '#DBE2DC',
  //       },
  //       grid: {
  //         display: false,
  //       },
  //     },
  //   },
  // };

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