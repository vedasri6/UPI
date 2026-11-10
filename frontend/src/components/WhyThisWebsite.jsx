import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Users, 
  HelpCircle, 
  Cpu, 
  Sparkles 
} from 'lucide-react';

export const WhyThisWebsite = () => {
  const { t } = useLanguage();

  const cards = [
    {
      id: 1,
      title: t.whyWebsite.card1.title,
      desc: t.whyWebsite.card1.desc,
      icon: HelpCircle,
      color: "from-blue-600 to-indigo-600",
      bgLight: "bg-blue-50/50 dark:bg-blue-950/20"
    },
    {
      id: 2,
      title: t.whyWebsite.card2.title,
      desc: t.whyWebsite.card2.desc,
      icon: Users,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50/50 dark:bg-amber-950/20"
    },
    {
      id: 3,
      title: t.whyWebsite.card3.title,
      desc: t.whyWebsite.card3.desc,
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50/50 dark:bg-emerald-950/20"
    },
    {
      id: 4,
      title: t.whyWebsite.card4.title,
      desc: t.whyWebsite.card4.desc,
      icon: Cpu,
      color: "from-purple-600 to-pink-600",
      bgLight: "bg-purple-50/50 dark:bg-purple-950/20"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-secondary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mission & Purpose</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.whyWebsite.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t.whyWebsite.subtitle}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                className={`p-8 rounded-3xl border border-slate-200/90 dark:border-slate-700/90 ${item.bgLight} shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 space-y-4`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                  <IconComp className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyThisWebsite;
