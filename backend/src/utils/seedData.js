const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course.model');
const User = require('../models/User.model');

dotenv.config();

// Helper function to generate slug
const generateSlug = (title) => {
  if (!title) return 'untitled';
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Sample course data
const getSampleCourses = () => {
  const now = Date.now();
  return [
    {
      title: 'Complete Web Development Bootcamp',
      slug: 'complete-web-development-bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch. Build real-world projects and become a full-stack developer.',
      category: 'Web Development',
      level: 'Beginner',
      price: 49.99,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      instructorName: 'John Smith',
      instructorBio: 'Senior Full Stack Developer with 10+ years of experience',
      modules: [
        {
          title: 'HTML & CSS Fundamentals',
          description: 'Learn the basics of HTML and CSS',
          duration: 120,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: true,
          order: 1,
        },
        {
          title: 'JavaScript Essentials',
          description: 'Master JavaScript programming',
          duration: 180,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: false,
          order: 2,
        },
        {
          title: 'React Basics',
          description: 'Learn React fundamentals',
          duration: 150,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: false,
          order: 3,
        },
      ],
      prerequisites: ['Basic computer knowledge'],
      learningObjectives: [
        'Build responsive websites',
        'Create full-stack applications',
        'Deploy applications to production',
      ],
      tags: ['React', 'Node.js', 'MongoDB', 'Express'],
      whatYouWillLearn: [
        'Build complete web applications',
        'Master frontend and backend development',
        'Work with databases',
        'Deploy applications',
      ],
      isPublished: true,
    },
    {
      title: 'Data Science Masterclass',
      slug: 'data-science-masterclass',
      description: 'Master data science, machine learning, and AI with Python. Learn Pandas, NumPy, Scikit-learn, and TensorFlow.',
      category: 'Data Science',
      level: 'Intermediate',
      price: 79.99,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      instructorName: 'Sarah Johnson',
      instructorBio: 'Data Scientist at Google, PhD in Computer Science',
      modules: [
        {
          title: 'Python for Data Science',
          description: 'Learn Python programming for data analysis',
          duration: 150,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: true,
          order: 1,
        },
        {
          title: 'Machine Learning Algorithms',
          description: 'Understand core ML algorithms',
          duration: 200,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: false,
          order: 2,
        },
        {
          title: 'Deep Learning with TensorFlow',
          description: 'Build neural networks with TensorFlow',
          duration: 180,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: false,
          order: 3,
        },
      ],
      prerequisites: ['Basic programming knowledge'],
      learningObjectives: [
        'Analyze complex datasets',
        'Build machine learning models',
        'Create data visualizations',
      ],
      tags: ['Python', 'ML', 'AI', 'Data Analysis'],
      whatYouWillLearn: [
        'Data analysis with Python',
        'Machine learning algorithms',
        'Deep learning with TensorFlow',
        'Data visualization',
      ],
      isPublished: true,
    },
    {
      title: 'Mobile App Development with React Native',
      slug: 'mobile-app-development-react-native',
      description: 'Build cross-platform mobile apps using React Native. Learn to create iOS and Android apps from one codebase.',
      category: 'Mobile Development',
      level: 'Intermediate',
      price: 59.99,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
      instructorName: 'Mike Chen',
      instructorBio: 'Mobile Developer with 8+ years of experience',
      modules: [
        {
          title: 'React Native Basics',
          description: 'Get started with React Native',
          duration: 130,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: true,
          order: 1,
        },
        {
          title: 'Navigation & State Management',
          description: 'Learn navigation and state management in React Native',
          duration: 160,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: false,
          order: 2,
        },
      ],
      prerequisites: ['React knowledge'],
      learningObjectives: [
        'Build iOS and Android apps',
        'Use native features',
        'Publish apps to app stores',
      ],
      tags: ['React Native', 'Mobile', 'iOS', 'Android'],
      whatYouWillLearn: [
        'Build cross-platform apps',
        'Use native APIs',
        'Deploy to app stores',
        'Work with state management',
      ],
      isPublished: true,
    },
    {
      title: 'DevOps Engineering',
      slug: 'devops-engineering',
      description: 'Master DevOps practices, CI/CD pipelines, Docker, Kubernetes, and cloud deployment. Learn to automate and scale applications.',
      category: 'DevOps',
      level: 'Advanced',
      price: 89.99,
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9',
      instructorName: 'Alex Rivera',
      instructorBio: 'DevOps Engineer at Amazon, AWS Certified',
      modules: [
        {
          title: 'Introduction to DevOps',
          description: 'Understanding DevOps principles',
          duration: 90,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: true,
          order: 1,
        },
        {
          title: 'Docker Containerization',
          description: 'Master Docker containers',
          duration: 180,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: false,
          order: 2,
        },
      ],
      prerequisites: ['Linux basics', 'Command line experience'],
      learningObjectives: [
        'Implement CI/CD pipelines',
        'Containerize applications',
        'Deploy to cloud platforms',
      ],
      tags: ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      whatYouWillLearn: [
        'Build CI/CD pipelines',
        'Work with Docker and Kubernetes',
        'Cloud deployment strategies',
        'Infrastructure as Code',
      ],
      isPublished: true,
    },
    {
      title: 'Cybersecurity Fundamentals',
      slug: 'cybersecurity-fundamentals',
      description: 'Learn essential cybersecurity concepts, ethical hacking, network security, and how to protect systems from cyber threats.',
      category: 'Cybersecurity',
      level: 'Beginner',
      price: 69.99,
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
      instructorName: 'Dr. Lisa Park',
      instructorBio: 'Cybersecurity Expert, PhD in Information Security',
      modules: [
        {
          title: 'Security Basics',
          description: 'Understanding security fundamentals',
          duration: 100,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: true,
          order: 1,
        },
      ],
      prerequisites: ['Basic IT knowledge'],
      learningObjectives: [
        'Identify security threats',
        'Implement security measures',
        'Conduct security assessments',
      ],
      tags: ['Security', 'Ethical Hacking', 'Network Security'],
      whatYouWillLearn: [
        'Security principles',
        'Threat identification',
        'Security best practices',
        'Incident response',
      ],
      isPublished: true,
    },
    {
      title: 'Cloud Computing with AWS',
      slug: 'cloud-computing-aws',
      description: 'Master Amazon Web Services, learn EC2, S3, Lambda, and serverless architecture. Prepare for AWS certification.',
      category: 'Cloud Computing',
      level: 'Intermediate',
      price: 74.99,
      thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8',
      instructorName: 'David Wilson',
      instructorBio: 'AWS Solutions Architect, 12x AWS Certified',
      modules: [
        {
          title: 'AWS Fundamentals',
          description: 'Introduction to AWS services',
          duration: 120,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: true,
          order: 1,
        },
        {
          title: 'Compute and Storage Services',
          description: 'Learn EC2, S3, EBS, and more',
          duration: 200,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          isFree: false,
          order: 2,
        },
      ],
      prerequisites: ['Basic networking knowledge'],
      learningObjectives: [
        'Design cloud architectures',
        'Deploy applications on AWS',
        'Implement security best practices',
      ],
      tags: ['AWS', 'Cloud', 'Serverless', 'DevOps'],
      whatYouWillLearn: [
        'AWS core services',
        'Cloud architecture design',
        'Security and compliance',
        'Cost optimization',
      ],
      isPublished: true,
    },
  ];
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('✅ Cleared existing courses');

    // Get or create a test instructor
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Test Instructor',
        email: 'instructor@example.com',
        password: 'Test123',
        role: 'instructor',
      });
      console.log('✅ Created test instructor');
    }

    // Get sample courses
    const sampleCourses = getSampleCourses();
    
    // Add instructor ID to each course
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructor: instructor._id,
    }));

    // Insert courses one by one
    let insertedCount = 0;
    for (const courseData of coursesWithInstructor) {
      try {
        const course = new Course(courseData);
        await course.save();
        console.log(`✅ Created course: ${courseData.title}`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error creating course ${courseData.title}:`, error.message);
        if (error.errors) {
          console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
      }
    }

    console.log(`✅ Successfully seeded ${insertedCount} courses`);
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();