import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react';
import Navbar from '../../layout/Navbar/Navbar';
import Footer from '../../layout/Footer/Footer';
import CourseCard from './CourseCard';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import axiosInstance from '../../../api/axios';

const CourseListing = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    price: '',
    search: '',
    sort: '-createdAt',
  });
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [filters]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        ...filters,
      });
      
      const response = await axiosInstance.get(`/courses?${params}`);
      
      if (response.data.success) {
        setCourses(response.data.data);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/courses/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      price: '',
      search: '',
      sort: '-createdAt',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        {/* Header */}
        <div className="bg-card border-b border-border py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-bold text-text">
              Explore Courses
            </h1>
            <p className="text-text text-opacity-60 mt-2">
              Find the perfect course to advance your career
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text text-opacity-40" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-card text-text placeholder-text placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-6 py-3 bg-card border border-border rounded-card hover:border-primary transition-colors duration-300"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-card border border-border rounded-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Price
                </label>
                <select
                  value={filters.price}
                  onChange={(e) => handleFilterChange('price', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="-createdAt">Newest</option>
                  <option value="createdAt">Oldest</option>
                  <option value="-studentsEnrolled">Most Popular</option>
                  <option value="-rating">Highest Rated</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Course Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text text-opacity-60 text-lg">
                No courses found matching your criteria
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-primary hover:text-secondary transition-colors duration-300"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-text text-opacity-60">
                  Showing {courses.length} of {pagination.total} courses
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 bg-card border border-border rounded-card text-text disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors duration-300"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages).keys()].map((num) => (
                    <button
                      key={num + 1}
                      onClick={() => handlePageChange(num + 1)}
                      className={`px-4 py-2 rounded-card transition-colors duration-300 ${
                        pagination.currentPage === num + 1
                          ? 'bg-primary text-background'
                          : 'bg-card border border-border text-text hover:border-primary'
                      }`}
                    >
                      {num + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 bg-card border border-border rounded-card text-text disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors duration-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseListing;