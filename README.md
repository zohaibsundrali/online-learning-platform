# 🎓 LearnHub - Online Learning Platform

A modern, full-featured Learning Management System (LMS) built with the MERN stack, designed to deliver a seamless learning experience for students and a comprehensive course management system for instructors.

**Live Demo:** [https://online-learning-platform-8jnz.vercel.app/](https://online-learning-platform-8jnz.vercel.app/)

---

## 📖 Project Overview

**LearnHub** is a professional Learning Management System (LMS) that connects students with expert instructors worldwide. The platform offers a complete learning ecosystem where students can discover, enroll in, complete courses and get Certificate while instructors can create, manage, and monetize their educational content.


## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure HTTP-only cookies
- Role-based access (Student, Instructor)
- Protected routes for authenticated users
- Secure password hashing with bcrypt
- Session management with automatic logout

### 👨‍🎓 Student Features
- **Browse & Discover Courses** - Search, filter, and sort courses by category, level, and price
- **Course Details** - View comprehensive course information including curriculum, instructor bio, and prerequisites
- **Enrollment** - One-click enrollment with automatic dashboard updates
- **Learning Page** - Dedicated video player with module sidebar, progress tracking, and lesson navigation
- **Progress Tracking** - Auto-calculated progress with module completion tracking
- **Certificates** - Generate and download professional PDF certificates upon course completion
- **Dashboard** - Overview of enrolled courses, progress statistics, and recent activity
- **Profile Management** - Update profile information, upload avatar, and change password
- **Resume Learning** - Continue from the last incomplete lesson automatically

### 👨‍🏫 Instructor Features
- **Instructor Dashboard** - View all created courses with statistics
- **Course Creation** - Comprehensive form with all course fields, modules, and resources
- **Course Management** - Edit, publish/unpublish, and delete courses
- **Module Management** - Add, edit, reorder, and delete modules
- **Course Analytics** - View student enrollment, completion rates, module performance, and revenue
- **Student Management** - Track enrolled students with progress and status
- **Thumbnail Upload** - Cloudinary integration for image uploads

### 📊 Dashboard Features
- **Statistics Overview** - Enrolled, completed, in-progress, and not-started courses
- **Progress Charts** - Visual representation of learning progress with Doughnut, Bar, and Line charts
- **Status Filtering** - Filter courses by status (Not Started, In Progress, Completed)
- **Search & Sort** - Find courses quickly with search and sorting options

### 📱 Responsive Design
- Mobile-first approach with Tailwind CSS
- Collapsible navigation for mobile devices
- Optimized for all screen sizes
- Touch-friendly interactions

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | UI Library |
| **React Router DOM** | Navigation & Routing |
| **React Hook Form** | Form handling with validation |
| **Tailwind CSS** | Styling and responsive design |
| **Chart.js** | Data visualization and charts |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **Axios** | HTTP client with interceptors |
| **Fonts** | Playfair Display & Poppins |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **express-validator** | Input validation |
| **Cloudinary** | Image upload and storage |
| **PDFKit** | Certificate generation |

---

## 📂 Folder Structure

```
online-learning-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js       # Cloudinary configuration
│   │   │   └── database.js         # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.model.js       # User schema
│   │   │   ├── Course.model.js     # Course schema
│   │   │   ├── Enrollment.model.js # Enrollment schema
│   │   │   └── Activity.model.js   # Activity tracking
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # Authentication logic
│   │   │   ├── course.controller.js # Course operations
│   │   │   ├── instructor.controller.js # Instructor operations
│   │   │   └── learning.controller.js # Learning page logic
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── course.routes.js
│   │   │   ├── instructor.routes.js
│   │   │   ├── learning.routes.js
│   │   │   ├── certificate.routes.js
│   │   │   └── user.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # Authentication middleware
│   │   │   ├── error.middleware.js # Error handling
│   │   │   └── upload.middleware.js # File upload
│   │   ├── services/
│   │   │   └── progress.service.js # Progress calculation
│   │   ├── utils/
│   │   │   ├── AppError.js         # Custom error class
│   │   │   └── catchAsync.js       # Async error wrapper
│   │   ├── validators/
│   │   │   └── auth.validator.js   # Input validation
│   │   ├── app.js                  # Express app configuration
│   │   └── server.js               # Server entry point
│   ├── .env                        # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js            # Axios instance with interceptors
│   │   │   └── endpoints.js        # API endpoints
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Input/
│   │   │   │   ├── LoadingSpinner/
│   │   │   │   ├── Toast/
│   │   │   │   ├── ProtectedRoute/
│   │   │   │   └── RoleBasedRoute/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar/         # Responsive navigation
│   │   │   │   └── Footer/
│   │   │   └── pages/
│   │   │       ├── Landing/        # Landing page sections
│   │   │       ├── Auth/           # Login & Register
│   │   │       ├── Dashboard/      # Student dashboard
│   │   │       ├── Courses/        # Course listing & details
│   │   │       ├── Learning/       # Learning page
│   │   │       └── Instructor/     # Instructor dashboard & management
│   │   ├── context/
│   │   │   └── AuthContext.js      # Authentication context
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Auth hook
│   │   ├── styles/
│   │   │   └── globals.css         # Global styles & Tailwind
│   │   ├── App.js                  # Main app with routes
│   │   └── index.js                # Entry point
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
│
├── README.md
└── .gitignore
```

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm 
- MongoDB Atlas account (or local MongoDB)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/online-learning-platform.git
cd online-learning-platform
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:
```bash
npm run dev
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

### Step 4: Seed Database (Optional)
```bash
cd backend
npm run seed
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/updatedetails` | Update user details |
| PUT | `/api/auth/updatepassword` | Update password |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get course details |
| GET | `/api/courses/categories` | Get categories |
| GET | `/api/courses/popular` | Get popular courses |
| POST | `/api/courses/:id/enroll` | Enroll in course |

### Instructor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/instructor/courses` | Get instructor courses |
| GET | `/api/instructor/stats` | Get instructor stats |
| POST | `/api/instructor/course` | Create course |
| PUT | `/api/instructor/course/:id` | Update course |
| PUT | `/api/instructor/course/:id/publish` | Toggle publish |
| DELETE | `/api/instructor/course/:id` | Delete course |
| GET | `/api/instructor/course/:id/analytics` | Get course analytics |
| GET | `/api/instructor/course/:id/students` | Get enrolled students |

### Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learning/:enrollmentId` | Get learning data |
| PUT | `/api/learning/:enrollmentId/module/:moduleId/complete` | Mark module complete |
| PUT | `/api/learning/:enrollmentId/position` | Update last position |

### Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certificates/:enrollmentId` | Download certificate |
| GET | `/api/certificates/:enrollmentId/info` | Check certificate availability |

---

## 🎯 User Workflows

### Student Journey
1. **Register/Login** → Select role as Student
2. **Browse Courses** → Explore available courses with search and filters
3. **View Course Details** → Check curriculum, instructor, and prerequisites
4. **Enroll** → One-click enrollment
5. **Learn** → Access learning page with video player and module navigation
6. **Track Progress** → Modules auto-mark as completed, progress updates
7. **Complete Course** → Reach 100% progress
8. **Get Certificate** → Download professional PDF certificate

### Instructor Journey
1. **Register/Login** → Select role as Instructor
2. **Dashboard** → View all courses and statistics
3. **Create Course** → Comprehensive form with all fields and modules
4. **Manage Modules** → Add, edit, reorder modules
5. **Publish** → Make course visible to students
6. **Analytics** → Track student enrollment, progress, and revenue
7. **Manage Students** → View enrolled students with progress

---

## 🌐 Deployment

### Backend Deployment (Render/Heroku)
```bash
# Add to package.json scripts
"start": "node server.js"
"build": "npm install"
```

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
```
Deploy the `build` folder to your hosting platform.

**Live URL:** [https://online-learning-platform-8jnz.vercel.app/](https://online-learning-platform-8jnz.vercel.app/)

---


## 🙏 Acknowledgments

- **MongoDB** - Database
- **Tailwind CSS** - Styling
- **Lucide** - Icons
- **Cloudinary** - Image upload
- **Chart.js** - Data visualization
- **PDFKit** - Certificate generation

---

## 📧 Contact

**Developer:** Muhammad Zohaib Hassan

**Project Link:** [https://online-learning-platform-8jnz.vercel.app/](https://online-learning-platform-8jnz.vercel.app/)

---

⭐ If you found this project helpful, please give it a star! ⭐