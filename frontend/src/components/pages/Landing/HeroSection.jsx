import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Users, BookOpen } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-card px-4 py-2 rounded-full border border-border">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm text-text">Trusted by 10,000+ students</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Learn from the{' '}
              <span className="text-primary">Best Instructors</span>{' '}
              Worldwide
            </h1>

            <p className="text-lg text-text text-opacity-80 leading-relaxed max-w-lg">
              Master new skills with our comprehensive online courses. 
              Learn at your own pace with expert instructors and join a 
              community of passionate learners.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/courses"
                className="btn-primary flex items-center justify-center space-x-2 group"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <button className="btn-secondary flex items-center justify-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-text text-opacity-70">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">200+</div>
                <div className="text-sm text-text text-opacity-70">Courses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">4.8</div>
                <div className="text-sm text-text text-opacity-70">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="bg-card rounded-card border border-border p-6 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-20 h-20 text-background opacity-50 mx-auto" />
                  <p className="text-background font-display text-xl mt-4">
                    Start Learning Today
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-4 -left-4 bg-card rounded-card border border-border p-4 shadow-lg animate-bounce-slow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-background" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Active Students</p>
                  <p className="text-xs text-text text-opacity-70">Join the community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;