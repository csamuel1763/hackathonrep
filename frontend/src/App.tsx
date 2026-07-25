import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import { AppLayout } from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import DashboardPage from './pages/DashboardPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import MarketplacePage from './pages/MarketplacePage';
import CareerAnalysisPage from './pages/CareerAnalysisPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';

export default function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <Router>
          <Routes>
            {/* Public Landing & Authentication Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Onboarding & Workspace Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/upload" element={<ResumeUploadPage />} />

              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/digital-twin" element={<DigitalTwinPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/career-analysis" element={<CareerAnalysisPage />} />
                <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ResumeProvider>
    </AuthProvider>
  );
}
