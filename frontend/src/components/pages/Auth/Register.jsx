import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/ToastProvider';
import Input from '../../common/Input/Input';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { BookOpen,  CheckCircle, GraduationCap, Users } from 'lucide-react';

const Register = () => {
  const { register: registerUser, user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'student',
    },
  });

  const password = watch('password');

  // ✅ Redirect based on role
  useEffect(() => {
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath);
    }
  }, [user, navigate, getDashboardPath]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading('Creating your account...');

    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role, // ✅ Send role to backend
      });

      if (result.success) {
        toast.success('Account created successfully! 🎉');
        // Redirect will happen in the useEffect
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      toast.dismiss(toastId);
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'student',
      label: 'Student',
      icon: GraduationCap,
      description: 'Learn from expert instructors and track your progress',
    },
    {
      value: 'instructor',
      label: 'Instructor',
      icon: Users,
      description: 'Create courses, share knowledge, and build your audience',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <BookOpen className="w-10 h-10 text-primary" />
            <span className="font-display text-3xl font-bold text-primary">
              LearnHub
            </span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-text mt-4">
            Create Account
          </h2>
          <p className="text-text text-opacity-60 text-sm mt-1">
            Start your learning journey today
          </p>
        </div>

        {/* Register Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              name="name"
              register={register}
              errors={errors}
              validation={{
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
                maxLength: {
                  value: 50,
                  message: 'Name cannot exceed 50 characters',
                },
              }}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              name="email"
              register={register}
              errors={errors}
              validation={{
                required: 'Email is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email',
                },
              }}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              name="password"
              register={register}
              errors={errors}
              validation={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)/,
                  message: 'Password must contain at least one letter and one number',
                },
              }}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              name="confirmPassword"
              register={register}
              errors={errors}
              validation={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              }}
            />

            {/* ✅ Role Selection */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedRole === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedRole(option.value);
                        // ✅ Update react-hook-form value
                        register('role').onChange({
                          target: { name: 'role', value: option.value },
                        });
                      }}
                      className={`
                        p-4 rounded-card border-2 transition-all duration-300 text-left
                        ${isSelected 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : 'border-border bg-background hover:border-primary hover:bg-primary hover:bg-opacity-5'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-text text-opacity-40'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                          {option.label}
                        </span>
                        <p className="text-xs text-text text-opacity-40 leading-tight">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Hidden input for react-hook-form */}
              <input
                type="hidden"
                {...register('role', { required: 'Please select a role' })}
                value={selectedRole}
              />
              {errors.role && (
                <p className="text-xs text-accent mt-1">{errors.role.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-2 text-sm text-text text-opacity-60">
              <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <p>
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:text-secondary transition-colors duration-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:text-secondary transition-colors duration-300">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text text-opacity-60 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-secondary transition-colors duration-300 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-text text-opacity-40 hover:text-primary text-sm transition-colors duration-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;