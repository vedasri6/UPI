import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Sparkles 
} from 'lucide-react';

export const EmailVerificationPage = () => {
  const { t } = useLanguage();
  const { verifyEmail, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || user?.email || 'citizen@upisuraksha.gov.in';
  const [code, setCode] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await verifyEmail(email, code);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-md mx-auto px-4 sm:px-6 py-12 w-full flex-grow flex flex-col justify-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs mb-6 w-fit transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.toolPages.backToHome}</span>
        </button>

        <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.auth.verifyTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {t.auth.verifyDesc}
            </p>
            <p className="text-xs font-bold text-primary dark:text-secondary font-mono">
              {email}
            </p>
          </div>

          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300 block">
              Demo Code Pre-filled: <span className="font-mono underline">123456</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit OTP Code:
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono font-black py-3.5 rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span>{t.auth.verifyBtn}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmailVerificationPage;
