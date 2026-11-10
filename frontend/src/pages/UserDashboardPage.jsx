import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  Bot, 
  QrCode, 
  CheckCheck, 
  BellRing, 
  PhoneCall, 
  User, 
  LogOut, 
  ArrowRight, 
  Sparkles, 
  Award,
  AlertTriangle,
  History
} from 'lucide-react';

export const UserDashboardPage = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toolLaunchers = [
    { title: t.features.aiAssistant.title, desc: "Verify suspicious messages", route: "/ai-assistant", icon: Bot, color: "bg-blue-500 text-white" },
    { title: t.features.qrScanner.title, desc: "Check QR merchant safety", route: "/qr-scanner", icon: QrCode, color: "bg-emerald-500 text-white" },
    { title: t.features.upiVerification.title, desc: "Check VPA handle history", route: "/upi-verifier", icon: CheckCheck, color: "bg-indigo-500 text-white" },
    { title: t.features.latestAlerts.title, desc: "Regional scam updates", route: "/alerts", icon: BellRing, color: "bg-amber-500 text-white" },
    { title: t.features.emergencyHelp.title, desc: "Direct call 1930 portal", route: "/emergency", icon: PhoneCall, color: "bg-red-600 text-white" },
    { title: t.features.awarenessQuiz.title, desc: "Take safety certification", route: "/quiz", icon: Award, color: "bg-rose-500 text-white" }
  ];

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-8">
        
        {/* Top Citizen Header Banner */}
        <div className="p-8 bg-gradient-to-r from-primary via-primary-light to-secondary text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-extrabold uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{t.auth.roleUser}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">
              Welcome, {user?.full_name || 'Citizen'}!
            </h1>
            <p className="text-sm text-blue-100 font-semibold max-w-xl">
              Your UPI Suraksha protection is ACTIVE. Use the security tools below to analyze threats and report scams.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 z-10">
            <Link
              to="/profile"
              className="px-5 py-3 bg-white hover:bg-slate-100 text-primary font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <User className="w-4 h-4" />
              <span>{t.auth.profileTitle}</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin-dashboard"
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-3 bg-red-600/80 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.auth.logout}</span>
            </button>
          </div>
        </div>

        {/* Security Health Score & Emergency Call Bar */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-emerald-300 dark:border-emerald-800/80 shadow-md flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0">
              100%
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">Security Health Score</h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">All security rules active & verified</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-amber-300 dark:border-amber-800/80 shadow-md flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400">0 Active Threat Scams</h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No compromised accounts detected</p>
            </div>
          </div>

          <div className="p-6 bg-red-600 text-white rounded-3xl shadow-md flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black uppercase text-red-200">Cyber Crime Helpline</h4>
              <p className="text-2xl font-black">Call 1930</p>
            </div>
            <a
              href="tel:1930"
              className="p-3.5 bg-white text-red-600 rounded-2xl shadow-lg font-black text-xs hover:scale-105 transition-transform"
            >
              Call Now
            </a>
          </div>
        </div>

        {/* Safety Tools Quick Launchers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Security Launchers & Tools
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolLaunchers.map((tool, idx) => {
              const IconComp = tool.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(tool.route)}
                  className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1.5 cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboardPage;
