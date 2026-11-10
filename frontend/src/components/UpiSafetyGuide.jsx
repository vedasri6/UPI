import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Smartphone, 
  UserCheck, 
  Building2, 
  KeyRound, 
  ShieldAlert, 
  Eye, 
  Calculator, 
  CheckCircle2, 
  Receipt, 
  PhoneCall,
  Sparkles
} from 'lucide-react';

export const UpiSafetyGuide = () => {
  const { t } = useLanguage();

  const steps = [
    { num: 1, text: t.upiGuide.step1, icon: Smartphone, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50" },
    { num: 2, text: t.upiGuide.step2, icon: UserCheck, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50" },
    { num: 3, text: t.upiGuide.step3, icon: Building2, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50" },
    { num: 4, text: t.upiGuide.step4, icon: KeyRound, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50" },
    { num: 5, text: t.upiGuide.step5, icon: ShieldAlert, color: "text-red-500 bg-red-50 dark:bg-red-950/50" },
    { num: 6, text: t.upiGuide.step6, icon: Eye, color: "text-teal-500 bg-teal-50 dark:bg-teal-950/50" },
    { num: 7, text: t.upiGuide.step7, icon: Calculator, color: "text-sky-500 bg-sky-50 dark:bg-sky-950/50" },
    { num: 8, text: t.upiGuide.step8, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50" },
    { num: 9, text: t.upiGuide.step9, icon: Receipt, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50" },
    { num: 10, text: t.upiGuide.step10, icon: PhoneCall, color: "text-red-600 bg-red-100 dark:bg-red-900/60" },
  ];

  return (
    <section id="awareness" className="py-16 md:py-24 bg-bgLight dark:bg-bgDark relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step-by-Step Security Protocol</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.upiGuide.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t.upiGuide.subtitle}
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          
          {/* Vertical Connecting Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-danger transform sm:-translate-x-1/2 rounded-full hidden sm:block" />

          {/* Mobile Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-danger rounded-full sm:hidden" />

          <div className="space-y-8">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={step.num}
                  className={`relative flex flex-col sm:flex-row items-center ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  
                  {/* Step Content Box */}
                  <div className="w-full sm:w-1/2 pl-16 sm:pl-0 sm:px-8">
                    <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${step.color}`}>
                          <IconComp className="w-5 h-5" />
                        </div>

                        <span className="text-xs font-black uppercase text-primary dark:text-secondary tracking-widest">
                          Rule #{step.num}
                        </span>
                      </div>

                      <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                        {step.text}
                      </p>
                    </div>
                  </div>

                  {/* Central Timeline Step Number Node */}
                  <div className="absolute left-6 sm:left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 border-primary dark:border-secondary flex items-center justify-center text-xs font-black text-slate-900 dark:text-white shadow-lg z-10">
                    {step.num}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpiSafetyGuide;
