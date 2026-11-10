import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  KeyRound
} from 'lucide-react';

export const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [resetToken, setResetToken] = useState(location.state?.resetToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);
  const getStrengthLabel = (score) => {
    if (score === 0) return { label: 'None', color: 'bg-slate-300 dark:bg-slate-700' };
    if (score <= 25) return { label: 'Weak', color: 'bg-red-500' };
    if (score <= 50) return { label: 'Fair', color: 'bg-amber-500' };
    if (score <= 75) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong & Safe', color: 'bg-emerald-500' };
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(resetToken, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-md mx-auto px-4 sm:px-6 py-12 w-full flex-grow flex flex-col justify-center">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs mb-6 w-fit transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.auth.resetPasswordTitle || t.auth.resetTitle || 'Reset Password'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {t.auth.resetPasswordDesc || t.auth.resetDesc || 'Enter your reset token and select a strong new password.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Reset Token */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Reset Token / Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="e.g. RESET_123456"
                  className="w-full pl-11 pr-4 py-3.5 text-sm font-mono font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (confirmPassword && e.target.value !== confirmPassword) {
                      setPasswordError('Passwords do not match');
                    } else {
                      setPasswordError('');
                    }
                  }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-500">{t.auth.passwordStrength}</span>
                    <span className="text-slate-900 dark:text-white">{strengthInfo.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthInfo.color} transition-all duration-300`}
                      style={{ width: `${strengthScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (newPassword && e.target.value !== newPassword) {
                      setPasswordError('Passwords do not match');
                    } else {
                      setPasswordError('');
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 text-sm font-semibold rounded-2xl border ${
                    passwordError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none`}
                />
              </div>
              {passwordError && (
                <span className="text-xs text-red-500 font-bold block mt-1">{passwordError}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!passwordError}
              className="w-full py-4 bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span>{t.auth.resetBtn}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
