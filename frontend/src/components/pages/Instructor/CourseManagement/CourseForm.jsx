import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useToast } from '../../../common/Toast/ToastProvider';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import {
  Plus,

  Upload,
  X,

  ChevronDown,
  ChevronUp,
 
} from 'lucide-react';
import axiosInstance from '../../../../api/axios';

const CourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [expandedModules, setExpandedModules] = useState([]);
  const fileInputRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      level: '',
      price: '',
      prerequisites: [''],
      learningObjectives: [''],
      whatYouWillLearn: [''],
      tags: [''],
      modules: [],
      isPublished: false,
    },
  });

  const { fields: moduleFields, append, remove, move } = useFieldArray({
    control,
    name: 'modules',
  });

  const { fields: prerequisiteFields, append: addPrerequisite, remove: removePrerequisite } = useFieldArray({
    control,
    name: 'prerequisites',
  });

  const { fields: objectiveFields, append: addObjective, remove: removeObjective } = useFieldArray({
    control,
    name: 'learningObjectives',
  });

  const { fields: learnFields, append: addLearn, remove: removeLearn } = useFieldArray({
    control,
    name: 'whatYouWillLearn',
  });

  const { fields: tagFields, append: addTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags',
  });

  // Fetch course data if editing
  useEffect(() => {
    if (courseId) {
      setIsEdit(true);
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/instructor/course/${courseId}`);
      if (response.data.success) {
        const course = response.data.data;
        // Set form values
        Object.keys(course).forEach(key => {
          if (key !== 'modules' && key !== '_id' && key !== '__v') {
            setValue(key, course[key]);
          }
        });
        // Set modules
        if (course.modules && course.modules.length > 0) {
          setValue('modules', course.modules);
        }
        // Set thumbnail preview
        if (course.thumbnail) {
          setThumbnailPreview(course.thumbnail);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course data');
      navigate('/instructor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (file) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    try {
      const response = await axiosInstance.post('/instructor/upload-thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw new Error('Failed to upload thumbnail');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const toastId = toast.loading(isEdit ? 'Updating course...' : 'Creating course...');

    try {
      // Upload thumbnail if new file selected
       if (thumbnailFile) {
      const thumbnailUrl = await uploadThumbnail(thumbnailFile);
      data.thumbnail = thumbnailUrl;
    } else if (!isEdit && !thumbnailPreview) {
      // ✅ If no thumbnail and it's a new course, use a default or show error
      toast.error('Please upload a thumbnail image');
      toast.dismiss(toastId);
      setLoading(false);
      return;
    }

      // Clean up empty arrays
      data.prerequisites = data.prerequisites.filter(p => p.trim() !== '');
      data.learningObjectives = data.learningObjectives.filter(o => o.trim() !== '');
      data.whatYouWillLearn = data.whatYouWillLearn.filter(l => l.trim() !== '');
      data.tags = data.tags.filter(t => t.trim() !== '');
      
      // Clean up modules
      data.modules = data.modules.map(module => ({
        ...module,
        resources: module.resources?.filter(r => r.title?.trim() || r.url?.trim()) || [],
      }));

      // Convert price to number
      data.price = parseFloat(data.price) || 0;

      let response;
      if (isEdit) {
        response = await axiosInstance.put(`/instructor/course/${courseId}`, data);
      } else {
        response = await axiosInstance.post('/instructor/course', data);
      }

      if (response.data.success) {
        toast.dismiss(toastId);
        toast.success(response.data.message);
        navigate('/instructor/dashboard');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpand = (index) => {
    setExpandedModules(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const addModule = () => {
    append({
      title: '',
      description: '',
      duration: 0,
      videoUrl: '',
      isFree: false,
      order: moduleFields.length,
      resources: [],
    });
    setExpandedModules([...expandedModules, moduleFields.length]);
  };

  const removeModule = (index) => {
    if (window.confirm('Are you sure you want to remove this module?')) {
      remove(index);
      setExpandedModules(expandedModules.filter(i => i !== index));
    }
  };

  const moveModule = (from, to) => {
    move(from, to);
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-text">
          {isEdit ? 'Edit Course' : 'Create New Course'}
        </h1>
        <button
          onClick={() => navigate('/instructor/dashboard')}
          className="text-text text-opacity-60 hover:text-primary transition-colors duration-300"
        >
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-6">Basic Information</h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Course Title <span className="text-accent">*</span>
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                placeholder="Enter course title"
                className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.title && (
                <p className="text-xs text-accent mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Description <span className="text-accent">*</span>
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows="4"
                placeholder="Describe what students will learn..."
                className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.description && (
                <p className="text-xs text-accent mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Category and Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Category <span className="text-accent">*</span>
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
                {errors.category && (
                  <p className="text-xs text-accent mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Level <span className="text-accent">*</span>
                </label>
                <select
                  {...register('level', { required: 'Level is required' })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
                {errors.level && (
                  <p className="text-xs text-accent mt-1">{errors.level.message}</p>
                )}
              </div>
            </div>

            {/* Price and Thumbnail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Price ($) <span className="text-accent">*</span>
                </label>
                <input
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' }
                  })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.price && (
                  <p className="text-xs text-accent mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Thumbnail <span className="text-accent">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-background border border-border rounded-card text-text hover:border-primary transition-colors duration-300 flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  {thumbnailPreview && (
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview('');
                          setThumbnailFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-0 right-0 p-0.5 bg-accent rounded-full hover:bg-opacity-90"
                      >
                        <X className="w-3 h-3 text-background" />
                      </button>
                    </div>
                  )}
                </div>
                {errors.thumbnail && (
                  <p className="text-xs text-accent mt-1">{errors.thumbnail.message}</p>
                )}
              </div>
            </div>

            {/* Published Status */}
            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                {...register('isPublished')}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <label className="text-sm text-text">
                Publish course immediately
              </label>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-6">Learning Objectives</h2>
          <div className="space-y-3">
            {objectiveFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`learningObjectives.${index}`)}
                  type="text"
                  placeholder={`Objective ${index + 1}`}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="p-2 text-text text-opacity-40 hover:text-accent transition-colors duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addObjective('')}
              className="text-sm text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Objective</span>
            </button>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-6">Prerequisites</h2>
          <div className="space-y-3">
            {prerequisiteFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`prerequisites.${index}`)}
                  type="text"
                  placeholder={`Prerequisite ${index + 1}`}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removePrerequisite(index)}
                  className="p-2 text-text text-opacity-40 hover:text-accent transition-colors duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPrerequisite('')}
              className="text-sm text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prerequisite</span>
            </button>
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-6">What You'll Learn</h2>
          <div className="space-y-3">
            {learnFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`whatYouWillLearn.${index}`)}
                  type="text"
                  placeholder={`Learning point ${index + 1}`}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeLearn(index)}
                  className="p-2 text-text text-opacity-40 hover:text-accent transition-colors duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addLearn('')}
              className="text-sm text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Learning Point</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-6">Tags</h2>
          <div className="space-y-3">
            {tagFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  {...register(`tags.${index}`)}
                  type="text"
                  placeholder={`Tag ${index + 1}`}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="p-2 text-text text-opacity-40 hover:text-accent transition-colors duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTag('')}
              className="text-sm text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tag</span>
            </button>
          </div>
        </div>

        {/* Modules Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text">Course Modules</h2>
            <button
              type="button"
              onClick={addModule}
              className="btn-primary text-sm py-2 px-4 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module</span>
            </button>
          </div>

          {moduleFields.length === 0 ? (
            <div className="text-center py-8 text-text text-opacity-60">
              <p>No modules added yet. Click "Add Module" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moduleFields.map((module, index) => {
                const isExpanded = expandedModules.includes(index);
                const moduleErrors = errors.modules?.[index];

                return (
                  <div key={module.id} className="bg-background rounded-card border border-border overflow-hidden">
                    {/* Module Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors duration-300"
                      onClick={() => toggleModuleExpand(index)}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-text text-opacity-40 font-medium">
                          Module {index + 1}
                        </span>
                        <span className="text-text font-medium">
                          {module.title || 'Untitled Module'}
                        </span>
                        {moduleErrors && (
                          <span className="text-xs text-accent">⚠️</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-text text-opacity-40">
                          {module.duration || 0}m
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-text text-opacity-40" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text text-opacity-40" />
                        )}
                      </div>
                    </div>

                    {/* Module Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-border space-y-4">
                        {/* Module Title */}
                        <div>
                          <label className="block text-sm font-medium text-text mb-1.5">
                            Module Title <span className="text-accent">*</span>
                          </label>
                          <input
                            {...register(`modules.${index}.title`, {
                              required: 'Module title is required',
                            })}
                            type="text"
                            placeholder="Enter module title"
                            className="w-full px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {moduleErrors?.title && (
                            <p className="text-xs text-accent mt-1">{moduleErrors.title.message}</p>
                          )}
                        </div>

                        {/* Module Description */}
                        <div>
                          <label className="block text-sm font-medium text-text mb-1.5">
                            Description <span className="text-accent">*</span>
                          </label>
                          <textarea
                            {...register(`modules.${index}.description`, {
                              required: 'Description is required',
                            })}
                            rows="2"
                            placeholder="Describe what this module covers..."
                            className="w-full px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {moduleErrors?.description && (
                            <p className="text-xs text-accent mt-1">{moduleErrors.description.message}</p>
                          )}
                        </div>

                        {/* Module Duration and Video URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text mb-1.5">
                              Duration (minutes) <span className="text-accent">*</span>
                            </label>
                            <input
                              {...register(`modules.${index}.duration`, {
                                required: 'Duration is required',
                                min: { value: 1, message: 'Duration must be at least 1 minute' },
                              })}
                              type="number"
                              placeholder="30"
                              className="w-full px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {moduleErrors?.duration && (
                              <p className="text-xs text-accent mt-1">{moduleErrors.duration.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-text mb-1.5">
                              Video URL <span className="text-accent">*</span>
                            </label>
                            <input
                              {...register(`modules.${index}.videoUrl`, {
                                required: 'Video URL is required',
                              })}
                              type="url"
                              placeholder="https://youtube.com/embed/xxx"
                              className="w-full px-4 py-2 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {moduleErrors?.videoUrl && (
                              <p className="text-xs text-accent mt-1">{moduleErrors.videoUrl.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Free Preview */}
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            {...register(`modules.${index}.isFree`)}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                          />
                          <label className="text-sm text-text">
                            Allow free preview
                          </label>
                        </div>

                        {/* Module Order */}
                        <div className="flex items-center space-x-4 pt-2">
                          <button
                            type="button"
                            onClick={() => moveModule(index, index - 1)}
                            disabled={index === 0}
                            className="text-xs text-text text-opacity-40 hover:text-primary transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Move Up
                          </button>
                          <button
                            type="button"
                            onClick={() => moveModule(index, index + 1)}
                            disabled={index === moduleFields.length - 1}
                            className="text-xs text-text text-opacity-40 hover:text-primary transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Move Down
                          </button>
                          <button
                            type="button"
                            onClick={() => removeModule(index)}
                            className="text-xs text-accent hover:text-opacity-80 transition-colors duration-300"
                          >
                            Delete Module
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/instructor/dashboard')}
            className="px-6 py-3 text-text text-opacity-60 hover:text-primary transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEdit ? 'Update Course' : 'Create Course'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;