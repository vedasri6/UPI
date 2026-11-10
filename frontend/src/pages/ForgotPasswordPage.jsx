import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  KeyRound, 
  Mail, 
  ArrowLeft, 
  Send, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const handleEmailChange = (val) => {
    setEmail(val);
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || emailError) return;

    setIsSubmitting(true);
    const res = await forgotPassword(email);
    setIsSubmitting(false);

    if (res.success) {
      setResetToken(res.reset_token);
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
            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.auth.forgotPasswordTitle || t.auth.forgotPassword}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {t.auth.forgotPasswordDesc || 'Enter your registered email address to receive password reset instructions.'}
            </p>
          </div>

          {resetToken ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-4 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                Reset Token Generated!
              </h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Token: <strong className="font-mono text-primary dark:text-secondary">{resetToken}</strong>
              </p>
              <button
                onClick={() => navigate('/reset-password', { state: { resetToken } })}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                Proceed to Reset Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="ramesh@village.in"
                    className={`w-full pl-11 pr-4 py-3.5 text-sm font-semibold rounded-2xl border ${
                      emailError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                    } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none`}
                  />
                </div>
                {emailError && (
                  <span className="text-xs text-red-500 font-bold block mt-1">{emailError}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!emailError}
                className="w-full py-4 bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>{t.auth.sendResetBtn}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
