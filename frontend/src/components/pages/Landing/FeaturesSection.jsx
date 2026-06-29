import React from 'react';
import { 
  Video, 
  Award, 
  Users, 
  Clock, 
  BookOpen, 
  MessageCircle 
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Video,
      title: 'Expert Video Lectures',
      description: 'Learn from industry experts through high-quality video lectures with practical examples.'
    },
    {
      icon: Award,
      title: 'Certificates of Completion',
      description: 'Earn recognized certificates for every course you complete and add them to your resume.'
    },
    {
      icon: Users,
      title: 'Community Learning',
      description: 'Join a vibrant community of learners, share knowledge, and collaborate on projects.'
    },
    {
      icon: Clock,
      title: 'Learn at Your Pace',
      description: 'Access course materials anytime, anywhere, and learn at a pace that suits you best.'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Curriculum',
      description: 'Well-structured courses with real-world projects and hands-on exercises.'
    },
    {
      icon: MessageCircle,
      title: 'Instructor Support',
      description: 'Get your questions answered by experienced instructors and teaching assistants.'
    }
  ];

  return (
    <section className="py-20 bg-card bg-opacity-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-primary">LearnHub</span>
          </h2>
          <p className="text-text text-opacity-80 text-lg">
            We provide everything you need to succeed in your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card group hover:bg-primary hover:bg-opacity-5 cursor-pointer"
              >
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-text">
                  {feature.title}
                </h3>
                <p className="text-text text-opacity-70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;