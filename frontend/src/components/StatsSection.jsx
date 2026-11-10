import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, 
  FileCheck, 
  BookOpenCheck, 
  ShieldAlert, 
  HeartHandshake 
} from 'lucide-react';

export const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    {
      id: 1,
      count: "150,000+",
      label: t.stats.protectedUsers,
      icon: Users,
      color: "from-blue-500 to-primary",
      textColor: "text-primary dark:text-sky-400"
    },
    {
      id: 2,
      count: "24,800+",
      label: t.stats.verifiedReports,
      icon: FileCheck,
      color: "from-emerald-500 to-secondary",
      textColor: "text-secondary dark:text-emerald-400"
    },
    {
      id: 3,
      count: "1,200+",
      label: t.stats.safetyArticles,
      icon: BookOpenCheck,
      color: "from-amber-500 to-warning",
      textColor: "text-warning dark:text-amber-400"
    },
    {
      id: 4,
      count: "18,400+",
      label: t.stats.fraudAlerts,
      icon: ShieldAlert,
      color: "from-red-500 to-danger",
      textColor: "text-danger dark:text-red-400"
    },
    {
      id: 5,
      count: "35,000+",
      label: t.stats.communityMembers,
      icon: HeartHandshake,
      color: "from-indigo-500 to-purple-600",
      textColor: "text-indigo-600 dark:text-indigo-400"
    }
  ];

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {t.stats.title}
          </h2>
          <div className="w-16 h-1 bg-primary dark:bg-secondary mx-auto mt-2 rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                className="relative group p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-secondary/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
              >
                {/* Icon Circle */}
                <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Count */}
                <div className={`text-2xl sm:text-3xl font-extrabold ${stat.textColor} tracking-tight`}>
                  {stat.count}
                </div>

                {/* Label */}
                <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
