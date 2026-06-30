import React, { useState, useEffect, useCallback } from 'react';
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
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 9,
  });

  // ✅ Fetch courses with useCallback
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters,
      });
      
      const response = await axiosInstance.get(`/courses?${params}`);
      
      if (response.data.success) {
        setCourses(response.data.data);
        setPagination({
          currentPage: response.data.currentPage || pagination.currentPage,
          totalPages: response.data.totalPages || 1,
          total: response.data.total || 0,
          limit: response.data.limit || pagination.limit,
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, filters]);

  // ✅ Fetch categories with useCallback
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/courses/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // ✅ Use fetchCourses and fetchCategories in useEffect
  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [fetchCourses, fetchCategories]); // ✅ Correct dependencies

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      price: '',
      search: '',
      sort: '-createdAt',
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Calculate range of items being shown
  const startItem = (pagination.currentPage - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.currentPage * pagination.limit, pagination.total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }

      if (current < total - 2) {
        pages.push('...');
      }

      pages.push(total);
    }

    return pages;
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

            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-card border border-border rounded-card p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-primary text-background'
                    : 'text-text text-opacity-60 hover:text-text'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors duration-300 ${
                  viewMode === 'list'
                    ? 'bg-primary text-background'
                    : 'text-text text-opacity-60 hover:text-text'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
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
              {/* Results Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <p className="text-text text-opacity-60 text-sm">
                  Showing <span className="font-medium text-text">{startItem}</span> -{' '}
                  <span className="font-medium text-text">{endItem}</span> of{' '}
                  <span className="font-medium text-text">{pagination.total}</span> courses
                </p>
                <p className="text-text text-opacity-40 text-xs">
                  {pagination.totalPages} pages total
                </p>
              </div>

              {/* Course Grid/List */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} viewMode={viewMode} />
                ))}
              </div>

              {/* Professional Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-10">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 bg-card border border-border rounded-card text-text disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-all duration-300 text-sm"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-2 text-text text-opacity-40">
                            …
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-card transition-all duration-300 min-w-[40px] text-sm ${
                              pagination.currentPage === page
                                ? 'bg-primary text-background font-medium'
                                : 'bg-card border border-border text-text hover:border-primary'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 bg-card border border-border rounded-card text-text disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-all duration-300 text-sm"
                    >
                      Next
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-xs text-text text-opacity-40">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </p>
                  </div>
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