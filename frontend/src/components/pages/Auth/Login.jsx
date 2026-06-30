import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/ToastProvider';
import Input from '../../common/Input/Input';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { BookOpen, Mail, Lock } from 'lucide-react';

const Login = () => {
  const { login, user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // ✅ Redirect based on role
  useEffect(() => {
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath);
    }
  }, [user, navigate, getDashboardPath]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading('Logging in...');

    try {
      const result = await login({
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        toast.success('Welcome back! 🎉');
        // Redirect will happen in the useEffect
      } else {
        toast.error(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      toast.dismiss(toastId);
      setIsLoading(false);
    }
  };

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
            Welcome Back
          </h2>
          <p className="text-text text-opacity-60 text-sm mt-1">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email',
                },
              }}
              icon={<Mail className="w-5 h-5" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              name="password"
              register={register}
              errors={errors}
              validation={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              icon={<Lock className="w-5 h-5" />}
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-secondary transition-colors duration-300"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text text-opacity-60 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary hover:text-secondary transition-colors duration-300 font-semibold"
              >
                Sign Up
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

export default Login;