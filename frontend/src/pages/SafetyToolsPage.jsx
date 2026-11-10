import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Bot, 
  ShieldCheck, 
  QrCode, 
  Link2, 
  MessageSquare, 
  ImageIcon, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  Smartphone
} from 'lucide-react';

export const SafetyToolsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toolsObj = t.safetyToolsPage || {};
  const toolPages = t.toolPages || {};

  const iconsMap = {
    'ai-assistant': Bot,
    'practice-upi': Smartphone,
    'upi-verifier': ShieldCheck,
    'qr-scanner': QrCode
  };
  const colorsMap = {
    'ai-assistant': 'bg-primary',
    'practice-upi': 'bg-amber-600',
    'upi-verifier': 'bg-emerald-600',
    'qr-scanner': 'bg-indigo-600'
  };

  const toolsList = (toolsObj.tools || []).map((tool) => ({
    ...tool,
    icon: iconsMap[tool.id] || Bot,
    color: colorsMap[tool.id] || 'bg-primary',
    path: tool.path || '/ai-assistant'
  }));

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-8">
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>{toolPages.backToHome || 'Back to Home'}</span>
          </button>
        </div>

        {/* Hero Title */}
        <div className="p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white rounded-[28px] shadow-2xl space-y-4 border border-slate-800">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{toolsObj.heroBadge || 'Interactive Cyber Security Suite'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {toolsObj.title || 'Interactive Cyber Safety Tools'}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-bold max-w-3xl leading-relaxed">
            {toolsObj.subtitle || 'Instant AI scam verification, UPI handle checking, QR payment safeguards, and phishing inspection tools built for citizen safety.'}
          </p>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolsList.map((tool, idx) => {
            const IconComp = tool.icon;
            return (
              <div
                key={tool.id || idx}
                className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-5 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${tool.color} text-white flex items-center justify-center shadow-lg`}>
                    <IconComp className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {tool.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <Link
                  to={tool.path}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary-light text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <span>{tool.btnText || 'Launch Tool'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default SafetyToolsPage;
