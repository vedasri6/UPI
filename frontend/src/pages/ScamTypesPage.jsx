import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ShieldAlert, 
  QrCode, 
  PhoneOff, 
  Gift, 
  Briefcase, 
  TrendingUp, 
  Smartphone, 
  KeyRound, 
  FileText, 
  Truck, 
  Zap, 
  Sparkles 
} from 'lucide-react';

export const ScamTypesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const scamPage = t.scamTypesPage || {};
  const toolPages = t.toolPages || {};

  const iconsMap = [ShieldAlert, QrCode, PhoneOff, Gift, Briefcase, Zap, TrendingUp, Smartphone, KeyRound, FileText, Truck, Zap];
  const colorsMap = ["bg-red-600", "bg-indigo-600", "bg-purple-600", "bg-amber-600", "bg-blue-600", "bg-emerald-600", "bg-rose-600", "bg-orange-600", "bg-red-700", "bg-teal-600", "bg-slate-700", "bg-amber-700"];

  const scamTypesList = (scamPage.scams || []).map((scam, i) => ({
    ...scam,
    icon: iconsMap[i % iconsMap.length],
    color: colorsMap[i % colorsMap.length]
  }));

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-8">
        
        {/* Navigation Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>{toolPages.backToHome || 'Back to Home'}</span>
        </button>

        {/* Hero Title */}
        <div className="p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white rounded-[28px] shadow-2xl space-y-4 border border-slate-800">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{scamPage.heroBadge || 'Cyber Threat Intelligence Library'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {scamPage.title || 'Recognize All 12 Cyber Scam Types'}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-bold max-w-3xl leading-relaxed">
            {scamPage.subtitle || 'Detailed protection guide for citizens, farmers, senior citizens, and students to identify how digital payment frauds work and how to stay safe.'}
          </p>
        </div>

        {/* Scam Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scamTypesList.map((scam, idx) => {
            const IconComp = scam.icon;
            return (
              <div
                key={scam.id || idx}
                className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-5 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${scam.color} text-white flex items-center justify-center shadow-lg shrink-0`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {scam.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                    {scam.desc}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      {scamPage.howItWorksLabel || 'How Scam Works:'}
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{scam.howItWorks}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      {scamPage.howToStaySafeLabel || 'How to Stay Safe:'}
                    </span>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug">{scam.howToStaySafe}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 block">
                    {scamPage.emergencyStepsLabel || 'Emergency Response:'}
                  </span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{scam.emergencySteps}</p>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ScamTypesPage;
