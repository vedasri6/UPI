import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Bot, 
  QrCode, 
  CheckCheck, 
  BellRing, 
  GraduationCap, 
  PhoneCall, 
  MessageSquareWarning, 
  Award,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const FeaturesPreview = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const feat = t.features || {};

  const features = [
    {
      id: 'aiAssistant',
      route: '/ai-assistant',
      icon: Bot,
      title: feat.aiAssistant?.title || 'AI Fraud Assistant',
      desc: feat.aiAssistant?.desc || 'Instant chatbot to verify suspicious WhatsApp messages, calls, or banking links.',
      color: "bg-blue-500/10 text-primary dark:text-sky-400 border-blue-200 dark:border-blue-800",
      btnBg: "bg-primary hover:bg-primary-light text-white"
    },
    {
      id: 'qrScanner',
      route: '/qr-scanner',
      icon: QrCode,
      title: feat.qrScanner?.title || 'Safe QR Scanner',
      desc: feat.qrScanner?.desc || 'Scan any payment QR code before paying to check recipient identity & risk score.',
      color: "bg-emerald-500/10 text-secondary dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      btnBg: "bg-secondary hover:bg-emerald-600 text-slate-900"
    },
    {
      id: 'upiVerification',
      route: '/upi-verifier',
      icon: CheckCheck,
      title: feat.upiVerification?.title || 'UPI ID Verifier',
      desc: feat.upiVerification?.desc || 'Check suspicious UPI handles / VPA IDs against reported cyber fraud databases.',
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      btnBg: "bg-indigo-600 hover:bg-indigo-700 text-white"
    },
    {
      id: 'latestAlerts',
      route: '/alerts',
      icon: BellRing,
      title: feat.latestAlerts?.title || 'Live Fraud Alerts',
      desc: feat.latestAlerts?.desc || 'Get real-time SMS & notification warnings about active scams in your district.',
      color: "bg-amber-500/10 text-warning dark:text-amber-400 border-amber-200 dark:border-amber-800",
      btnBg: "bg-amber-500 hover:bg-amber-600 text-slate-900"
    },
    {
      id: 'awarenessHub',
      route: '/awareness-hub',
      icon: GraduationCap,
      title: feat.awarenessHub?.title || 'Voice & Video Hub',
      desc: feat.awarenessHub?.desc || 'Listen to easy voice guides and watch animated safety videos in your language.',
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      btnBg: "bg-purple-600 hover:bg-purple-700 text-white"
    },
    {
      id: 'emergencyHelp',
      route: '/emergency',
      icon: PhoneCall,
      title: feat.emergencyHelp?.title || '1930 Cyber Support',
      desc: feat.emergencyHelp?.desc || 'One-tap direct dial to National Cyber Crime Reporting Portal Helpline.',
      color: "bg-red-500/10 text-danger dark:text-red-400 border-red-200 dark:border-red-800",
      btnBg: "bg-red-600 hover:bg-red-700 text-white"
    },
    {
      id: 'communityReports',
      route: '/report-scam',
      icon: MessageSquareWarning,
      title: feat.communityReports?.title || 'Report Scam Number',
      desc: feat.communityReports?.desc || 'Report fraudulent phone numbers or fake UPI handles to protect your village.',
      color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
      btnBg: "bg-teal-600 hover:bg-teal-700 text-white"
    },
    {
      id: 'awarenessQuiz',
      route: '/quiz',
      icon: Award,
      title: feat.awarenessQuiz?.title || 'Safety Awareness Quiz',
      desc: feat.awarenessQuiz?.desc || 'Test your digital payment safety knowledge and earn official safety certificate.',
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      btnBg: "bg-rose-600 hover:bg-rose-700 text-white"
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-bgLight dark:bg-bgDark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-secondary text-xs font-black uppercase tracking-wider border border-primary/20 dark:border-primary/40">
            <ShieldCheck className="w-4 h-4" />
            <span>{feat.officialSuite || 'Official Cyber Safety Suite'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {feat.title}
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto">
            {feat.subtitle}
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.route)}
                className="group relative p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/90 dark:border-slate-700/90 hover:border-primary dark:hover:border-secondary shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Icon Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-4 rounded-2xl border ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <IconComp className="w-7 h-7" />
                    </div>

                    <span className="text-xs font-black uppercase text-primary dark:text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                      <span>{feat.open || 'Open'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.route);
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide flex items-center justify-between ${item.btnBg} shadow-md group-hover:shadow-lg transition-all duration-200`}
                >
                  <span>{feat.exploreBtn}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesPreview;
