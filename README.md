# 🎓 Smart Attendance Monitoring System

> **"The Last Roll Call You'll Ever Take"**

An intelligent AI-powered attendance system that revolutionizes traditional classroom attendance tracking through facial recognition technology. Built for the modern classroom, this system eliminates manual roll calls and provides real-time attendance monitoring.

![Landing Page](./frontend/public/landing_page.png)

## 🌟 Overview

The Smart Attendance Monitoring System leverages cutting-edge facial recognition technology to automate attendance tracking in educational institutions. Using just a browser and webcam, teachers can monitor student attendance in real-time with unprecedented accuracy and efficiency.

### ✨ Key Features

- **🤖 AI-Powered Face Recognition**: Advanced facial recognition using Face-API.js
- **⚡ Real-Time Attendance**: Instant attendance marking as students appear in camera
- **📊 Comprehensive Dashboard**: Visual analytics and attendance statistics
- **📄 Automated Reports**: Generate detailed attendance reports in PDF format
- **🔐 Secure Authentication**: Multi-provider authentication with Clerk
- **☁️ Cloud-Based**: Powered by Supabase for scalable database management
- **📱 Responsive Design**: Works seamlessly across devices

## 🏗️ System Architecture

### Frontend Stack
- **React 19.2.4** - Modern UI library with latest features
- **Vite 8.0.1** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **Framer Motion 12.38.0** - Smooth animations and interactions
- **React Router DOM 7.13.2** - Client-side routing

### AI & Recognition
- **Face-API.js 0.22.2** - JavaScript face recognition library
- **Pre-trained Models**: SSD MobileNet, Face Landmark, Face Recognition models

### Backend & Services
- **Supabase** - PostgreSQL database with real-time capabilities
- **Clerk** - Authentication and user management
- **PDF Generation** - jsPDF with AutoTable for reports

## 📸 Application Screenshots

### 🏠 Landing Page
![Landing Page](frontend/public/landing_page.png)
*Welcome screen with compelling messaging about AI-powered attendance*

### 🔐 User Registration
![Sign Up](frontend/public/sign_up.png)
*Secure registration with Google OAuth integration*

### 📊 Dashboard Overview
![Dashboard](frontend/public/dashboard.png)
*Comprehensive dashboard showing classes, students, and attendance metrics*

### 🏫 Class Management
![Create Class](frontend/public/create_a_class.png)
*Easy class creation with scheduling capabilities*

### 👥 Student Registration
![Add Student](frontend/public/add_student.png)
*Student enrollment with roll number and contact information*

### 📷 Face Registration
![Face Registration](frontend/public/face_registration.png)
*Biometric registration for accurate facial recognition*

### 🎥 Live Attendance Monitoring
![Class Session](frontend/public/class_session_with_camera_feed.png)
*Real-time attendance tracking with live camera feed and student roster*

### 📋 Attendance Reports
![Attendance Report](frontend/public/attendance_report.png)
*Detailed attendance reports with timestamps and statistics*

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Modern web browser** with camera support
- **Supabase account** (for database)
- **Clerk account** (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-attendance-system.git
   cd smart-attendance-system
   ```

2. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

5. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL migration script:
   ```bash
   # Copy contents of supabase-migration.sql to Supabase SQL Editor
   ```

6. **Configure Clerk authentication**
   - Set up authentication providers in Clerk dashboard
   - Configure redirect URLs for your domain

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open in browser**
   Navigate to `http://localhost:5173`

## 🎯 How It Works

### 1. **Teacher Registration & Setup**
- Teachers sign up using email or Google OAuth
- Create and configure class schedules
- Set up student roster with basic information

### 2. **Student Face Registration**
- Students register their faces through the camera interface
- AI creates unique facial descriptors stored securely
- Multiple angles captured for improved accuracy

### 3. **Attendance Monitoring**
- Teacher starts a class session
- Camera continuously scans for registered faces
- Automatic attendance marking with timestamp
- Real-time student roster updates

### 4. **Reports & Analytics**
- Generate comprehensive attendance reports
- Export data in PDF format
- Track attendance patterns and statistics
- Monitor class participation trends

## 🔧 Technical Implementation

### Face Recognition Pipeline

1. **Face Detection**: SSD MobileNet model detects faces in video stream
2. **Landmark Detection**: 68-point facial landmark identification
3. **Face Description**: Generate 128-dimensional face descriptor
4. **Matching**: Compare with registered student descriptors
5. **Attendance Marking**: Automatic marking when match confidence > threshold

### Database Schema

```sql
-- Core Tables
├── teachers (Clerk integration)
├── students (global student pool)
├── classes (teacher-managed classes)
├── class_students (enrollment relationships)
├── sessions (class attendance sessions)
└── attendance (attendance records with timestamps)
```

### Security Features

- **Encrypted Face Data**: Facial descriptors stored as encrypted JSONB
- **Secure Authentication**: JWT tokens with Clerk
- **Role-based Access**: Teacher/Student permission levels
- **Data Privacy**: GDPR-compliant data handling

## 🎨 UI/UX Features

- **Dark Theme**: Modern dark interface for reduced eye strain
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Intuitive Navigation**: Clean, user-friendly interface
- **Real-time Updates**: Live attendance status updates
- **Accessibility**: WCAG compliant design principles

## 📈 Performance Optimizations

- **Model Loading**: Lazy loading of AI models
- **Image Processing**: Optimized face detection algorithms
- **Real-time Updates**: Efficient WebSocket connections
- **Caching**: Strategic caching of student data
- **Bundle Optimization**: Code splitting and tree shaking

## 🔍 Software Engineering Practices

### Code Quality
- **ESLint Configuration**: Strict linting rules
- **Component Architecture**: Reusable React components
- **State Management**: Efficient React hooks usage
- **Error Handling**: Comprehensive error boundaries

### Version Control
- **Git Workflow**: Feature branch development
- **Commit Standards**: Conventional commit messages
- **Code Reviews**: Pull request workflow

### Testing Strategy
- **Unit Testing**: Component and utility function tests
- **Integration Testing**: API and database integration tests
- **E2E Testing**: User journey automation tests

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Configure production environment variables
- Set up SSL certificates for camera access
- Configure CORS settings for API access

### Hosting Options
- **Vercel**: Recommended for frontend deployment
- **Netlify**: Alternative static hosting option
- **Self-hosted**: Docker containerization available

## 🛠️ Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 📋 Future Enhancements

- [ ] **Mobile Application**: React Native implementation
- [ ] **Bulk Import**: CSV student data import
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Integration APIs**: LMS system integration
- [ ] **Offline Mode**: Local storage for connectivity issues
- [ ] **Multi-language**: Internationalization support

## 🤝 Contributing

We welcome contributions to improve the Smart Attendance Monitoring System!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Software Engineering Class Project**
- Built with modern web technologies
- Focused on user experience and performance
- Implements industry best practices

## 🆘 Support

For support and questions:
- 📧 Email: support@smartattend.com
- 📖 Documentation: [Wiki](https://github.com/yourusername/smart-attendance-system/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/smart-attendance-system/issues)

---

## 🎯 Project Highlights for Software Engineering

This project demonstrates proficiency in:
- **Full-Stack Development**: Frontend and backend integration
- **Modern JavaScript**: ES6+, React hooks, async/await
- **Database Design**: Relational database modeling
- **API Integration**: RESTful services and real-time updates
- **AI/ML Integration**: Computer vision and machine learning
- **Security Implementation**: Authentication and data protection
- **Performance Optimization**: Efficient algorithms and caching
- **User Experience**: Intuitive design and accessibility
- **Software Architecture**: Scalable and maintainable code structure
- **DevOps Practices**: Build tools, deployment, and monitoring

**Built with ❤️ for the future of education technology**