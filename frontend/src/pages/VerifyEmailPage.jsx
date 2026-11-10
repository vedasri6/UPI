import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { Mail, CheckCircle2, ShieldAlert, RefreshCw, ArrowRight } from 'lucide-react';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { verifyEmail, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState(location.state?.email || user?.email || '');
  const [code, setCode] = useState(location.state?.code || '123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      showError('Please enter valid email and 6-digit OTP code');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyEmail(email, code);
      showSuccess(res.message || 'Email verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    showSuccess('New verification code sent to your email! (Demo OTP: 123456)');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-bgDark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80">
          
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                <Mail className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.auth?.verifyEmailTitle || 'Verify Email Address'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t.auth?.verifyEmailSubtitle || 'Enter the 6-digit OTP code sent to your registered email'}
            </p>
          </div>

          {/* Quick Notice Banner with prefilled code for testing */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">Verification Code Dispatched:</span>
              Use code <strong className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">{code}</strong> to instantly verify your account.
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth?.emailLabel || 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth?.codeLabel || '6-Digit OTP Code'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="block w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-light text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.auth?.verifyEmailBtn || 'Verify Email'}</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-secondary flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.auth?.resendCode || 'Resend Code'}</span>
            </button>

            <Link to="/dashboard" className="font-bold text-primary dark:text-secondary hover:underline inline-flex items-center gap-1">
              <span>Skip for now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
