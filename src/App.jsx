import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ClassDetailPage from './pages/ClassDetailPage';
import LiveSessionPage from './pages/LiveSessionPage';
import AdminDashPage from './pages/AdminDashPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/sign-in/*"
        element={
          <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4 relative">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/[0.06] rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/[0.04] rounded-full blur-[100px]" />
            <div className="relative z-10">
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/dashboard" />
            </div>
          </div>
        }
      />
      <Route
        path="/sign-up/*"
        element={
          <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4 relative">
            <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-violet-500/[0.06] rounded-full blur-[100px]" />
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-500/[0.04] rounded-full blur-[100px]" />
            <div className="relative z-10">
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/dashboard" />
            </div>
          </div>
        }
      />

      {/* Admin Route (password-gated, not Clerk-gated) */}
      <Route path="/admin-dash" element={<AdminDashPage />} />

      {/* Protected Routes (requires Clerk auth) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/class/:classId" element={<ClassDetailPage />} />
        </Route>
        <Route path="/class/:classId/session" element={<LiveSessionPage />} />
      </Route>
    </Routes>
  );
}

export default App;
