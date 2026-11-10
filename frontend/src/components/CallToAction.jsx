import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  PhoneCall, 
  BookOpen, 
  ShieldAlert, 
  Sparkles,
  ArrowRight 
} from 'lucide-react';

export const CallToAction = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gradient-to-r from-primary via-primary-light to-secondary text-white relative overflow-hidden shadow-2xl">
      
      {/* Decorative SVG Pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          <span>Citizen Protection Action</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          {t.cta.title}
        </h2>

        <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto font-normal">
          {t.cta.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          
          <a
            href="#scams"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-primary font-extrabold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
          >
            <BookOpen className="w-5 h-5" />
            <span>{t.cta.startLearning}</span>
            <ArrowRight className="w-5 h-5" />
          </a>

          <a
            href="tel:1930"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-red-600/50 transition-all border border-red-500 animate-pulse-subtle"
          >
            <PhoneCall className="w-5 h-5" />
            <span>{t.cta.emergencyHelp}</span>
          </a>
        </div>

        <p className="text-xs text-blue-200 font-medium max-w-xl mx-auto pt-2">
          {t.cta.helplineDesc}
        </p>
      </div>
    </section>
  );
};

export default CallToAction;
