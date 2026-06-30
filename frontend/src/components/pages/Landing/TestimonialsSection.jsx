import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Web Developer',
      content: 'LearnHub completely transformed my career. The courses are well-structured and the instructors are amazing. I landed my dream job within 3 months!',
      rating: 5,
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Data Scientist',
      content: 'The data science program is exceptional. The practical projects and real-world examples helped me build a strong portfolio. Highly recommended!',
      rating: 5,
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      content: 'I love the flexible learning format. Being able to learn at my own pace while working full-time has been a game-changer for me.',
      rating: 4,
      avatar: 'ER'
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-primary">Students Say</span>
          </h2>
          <p className="text-text text-opacity-80 text-lg">
            Real stories from real learners who transformed their careers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'text-accent fill-accent'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <p className="text-text text-opacity-80 text-sm leading-relaxed mb-6">
                "{testimonial.content}"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-background font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-text text-opacity-60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;