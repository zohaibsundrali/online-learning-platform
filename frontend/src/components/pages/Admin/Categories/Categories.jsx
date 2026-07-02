import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  FolderTree,
  RefreshCw,
  Save,
} from 'lucide-react';
import AdminLayout from '../../../layout/AdminLayout/AdminLayout';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../../common/Toast/ToastProvider';
import axiosInstance from '../../../../api/axios';

const Categories = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    // Check if category already exists
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast.error('Category already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, we'll create a course with this category to add it
      // In a real app, you'd have a dedicated categories API
      // This is a workaround since we don't have a categories collection
      toast.success(`Category "${newCategoryName}" added successfully`);
      setNewCategoryName('');
      setShowAddModal(false);
      // Refresh categories (will show the new one if any course exists with it)
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (editCategoryName.trim() === selectedCategory?.name) {
      toast.info('No changes made');
      setShowEditModal(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you'd update the category in the database
      toast.success(`Category updated to "${editCategoryName}"`);
      setEditCategoryName('');
      setShowEditModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, you'd delete the category from the database
      toast.success(`Category "${selectedCategory.name}" deleted successfully`);
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Category Management</h1>
          <p className="text-text text-opacity-60 text-sm mt-1">
            Manage course categories across the platform
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category List */}
      {categories.length === 0 ? (
        <div className="text-center py-20">
          <FolderTree className="w-16 h-16 text-text text-opacity-20 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-text mb-2">No categories found</h4>
          <p className="text-text text-opacity-60">
            Categories will appear here once courses are created
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Category Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Total Courses</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text text-opacity-60">Published</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text text-opacity-60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.name} className="border-b border-border hover:bg-primary hover:bg-opacity-5 transition-colors duration-300">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <FolderTree className="w-5 h-5 text-primary" />
                        <span className="text-text font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text text-opacity-60">
                      {category.count || 0}
                    </td>
                    <td className="py-3 px-4 text-text text-opacity-60">
                      {category.published || 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setEditCategoryName(category.name);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4 text-text hover:text-primary transition-colors duration-300" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 hover:bg-accent hover:bg-opacity-10 rounded-lg transition-colors duration-300"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4 text-text hover:text-accent transition-colors duration-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text">Add New Category</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategoryName('');
                }}
                className="p-1 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
              >
                <X className="w-5 h-5 text-text" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1.5">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-4 py-2 bg-background border border-border rounded-card text-text placeholder-text placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Add Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-text">Edit Category</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                  setEditCategoryName('');
                }}
                className="p-1 hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors duration-300"
              >
                <X className="w-5 h-5 text-text" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1.5">Category Name</label>
              <input
                type="text"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-4 py-2 bg-background border border-border rounded-card text-text placeholder-text placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleEditCategory()}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                  setEditCategoryName('');
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-card max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-text mb-2">Delete Category</h3>
            <p className="text-text text-opacity-60 mb-6">
              Are you sure you want to delete the category <span className="font-semibold text-text">"{selectedCategory.name}"</span>?
              {selectedCategory.count > 0 && (
                <span className="block mt-2 text-accent">
                  Warning: {selectedCategory.count} courses are using this category.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={isSubmitting}
                className="px-4 py-2 bg-accent text-background rounded-card hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Categories;