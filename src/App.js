import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import ReferralTracker from './components/ReferralTracker';

// Pages - Lazy loaded
import Loader from './pages/Loader';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const CourseList = lazy(() => import('./pages/CourseList'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer'));
const ExamBooking = lazy(() => import('./pages/ExamBooking'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCourses = lazy(() => import('./pages/AdminCourses'));
const AdminStudents = lazy(() => import('./pages/AdminStudents'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminExams = lazy(() => import('./pages/AdminExams'));
const AdminDoubtSessions = lazy(() => import('./pages/AdminDoubtSessions'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));
const DoubtSessions = lazy(() => import('./pages/DoubtSessions'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const ReferAndEarn = lazy(() => import('./pages/ReferAndEarn'));


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ReferralTracker />
          <div className="min-h-screen bg-background transition-colors duration-300">
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Loader />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:id/learn"
                  element={
                    <ProtectedRoute>
                      <CoursePlayer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exams"
                  element={
                    <ProtectedRoute>
                      <ExamBooking />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminStudents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/admins"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPayments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/exams"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminExams />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/doubt-sessions"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDoubtSessions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/refer-and-earn"
                  element={
                    <ProtectedRoute>
                      <ReferAndEarn />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doubt-sessions"
                  element={
                    <ProtectedRoute>
                      <DoubtSessions />
                    </ProtectedRoute>
                  }
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  </ThemeProvider>
);
}

export default App;
