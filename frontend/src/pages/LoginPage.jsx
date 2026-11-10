import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const LoginPage = () => {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.registered) {
      setRegisteredSuccess(true);
      if (location.state.registeredEmail) {
        setEmail(location.state.registeredEmail);
      }
    }
  }, [location]);

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
    if (!email || !password || emailError) return;

    setIsSubmitting(true);
    const res = await login(email, password, rememberMe);
    setIsSubmitting(false);

    if (res.success) {
      const destination = location.state?.from?.pathname;
      if (res.user?.role === 'admin') {
        navigate(destination || '/admin');
      } else {
        navigate(destination || '/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-md mx-auto px-4 sm:px-6 py-12 w-full flex-grow flex flex-col justify-center">
        
        {/* Back Navigation Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs mb-6 w-fit transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.toolPages.backToHome}</span>
        </button>

        {/* Card Container */}
        <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 text-primary dark:text-secondary rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
              <LogIn className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.auth.loginTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {t.auth.loginDesc}
            </p>
          </div>

          {/* Registration Success Banner */}
          {registeredSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs font-bold leading-relaxed">
                {language === 'te' 
                  ? "మీ ఖాతా విజయవంతంగా సృష్టించబడింది! దయచేసి మీ డాష్‌బోర్డ్‌లోకి ప్రవేశించడానికి లాగిన్ చేయండి."
                  : "Account successfully created! Please sign in with your password to access your Dashboard."}
              </div>
            </div>
          )}

          {/* Quick Demo Fill Buttons */}
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2">
            <span className="text-[11px] font-bold text-primary dark:text-sky-300 block uppercase tracking-wider">
              Quick Demo Fill:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleEmailChange('citizen@upisuraksha.gov.in');
                  setPassword('User@12345');
                }}
                className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 hover:border-primary transition-all"
              >
                Citizen User
              </button>
              <button
                type="button"
                onClick={() => {
                  handleEmailChange('admin@upisuraksha.gov.in');
                  setPassword('Admin@12345');
                }}
                className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all"
              >
                Admin Officer
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
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
                    emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-primary'
                  } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                />
              </div>
              {emailError && (
                <span className="text-[11px] text-red-500 font-bold block mt-1">{emailError}</span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t.auth.password}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary dark:text-secondary hover:underline"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.auth.rememberMe}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !!emailError}
              className="w-full py-4 bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              <span>{t.auth.loginBtn}</span>
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-primary dark:text-secondary font-extrabold hover:underline">
              {t.auth.registerBtn}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
