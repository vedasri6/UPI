import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Eager load HomePage for instant hero rendering
import HomePage from './pages/HomePage';

// Lazy load route pages for bundle performance optimization
const AiAssistantPage = lazy(() => import('./pages/AiAssistantPage'));
const QrScannerPage = lazy(() => import('./pages/QrScannerPage'));
const UpiVerifierPage = lazy(() => import('./pages/UpiVerifierPage'));
const PracticeUpiPage = lazy(() => import('./pages/PracticeUpiPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const AwarenessHubPage = lazy(() => import('./pages/AwarenessHubPage'));
const EmergencyPage = lazy(() => import('./pages/EmergencyPage'));
const ReportScamPage = lazy(() => import('./pages/ReportScamPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// New Section 3, 4, 5 Pages
const SecurityProtocolsPage = lazy(() => import('./pages/SecurityProtocolsPage'));
const ScamTypesPage = lazy(() => import('./pages/ScamTypesPage'));
const SafetyToolsPage = lazy(() => import('./pages/SafetyToolsPage'));

// Lazy load Auth Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

// Page Loading Skeleton Fallback Component
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-bgLight dark:bg-bgDark flex flex-col items-center justify-center space-y-4 transition-colors">
    <div className="w-16 h-16 rounded-3xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-sky-400 flex items-center justify-center shadow-lg border border-primary/20 animate-pulse">
      <ShieldCheck className="w-8 h-8 text-secondary" />
    </div>
    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700 dark:text-slate-200">
      <Loader2 className="w-4 h-4 animate-spin text-primary" />
      <span>Loading Community UPI Prevention & Awareness Platform...</span>
    </div>
  </div>
);

export function App() {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <ThemeProvider>
          <AuthProvider>
          <Router>
            <ScrollToTop />
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Home & Interactive Tool Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/ai-assistant" element={<AiAssistantPage />} />
                <Route path="/qr-scanner" element={<QrScannerPage />} />
                <Route path="/upi-verifier" element={<UpiVerifierPage />} />
                <Route path="/practice-upi" element={<PracticeUpiPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/awareness-hub" element={<AwarenessHubPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/report-scam" element={<ReportScamPage />} />
                <Route path="/quiz" element={<QuizPage />} />

                {/* New Section 3, 4, 5 Pages */}
                <Route path="/security-protocols" element={<SecurityProtocolsPage />} />
                <Route path="/scams" element={<ScamTypesPage />} />
                <Route path="/safety-tools" element={<SafetyToolsPage />} />

                {/* Authentication Module Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/user-dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

                {/* Catch-all route redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  </LanguageProvider>
  );
}

export default App;
