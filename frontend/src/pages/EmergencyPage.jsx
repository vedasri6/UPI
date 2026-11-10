import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  PhoneCall, 
  ArrowLeft, 
  ShieldAlert, 
  ExternalLink, 
  Building2, 
  Lock, 
  Camera, 
  FileText, 
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const EmergencyPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const em = t?.emergencyPage || {};

  // 7 Large Emergency Action Cards dynamically configured with active language
  const emergencyCards = [
    {
      id: 1,
      icon: PhoneCall,
      title: em.card1?.title || "Call 1930 Immediately",
      desc: em.card1?.desc || "National Cyber Crime Helpline (Toll-Free 24x7). Call within 2 hours to freeze stolen money across banks.",
      actionText: em.card1?.actionText || "Tap to Call 1930 Now",
      href: "tel:1930",
      isExternal: false,
      colorBg: "bg-red-600 text-white shadow-red-600/30 border-red-500",
      btnBg: "bg-white text-red-600 hover:bg-slate-100 font-black"
    },
    {
      id: 2,
      icon: ExternalLink,
      title: em.card2?.title || "Report at cybercrime.gov.in",
      desc: em.card2?.desc || "Official Ministry of Home Affairs Cyber Crime Portal to file an official online complaint for investigation.",
      actionText: em.card2?.actionText || "Visit cybercrime.gov.in",
      href: "https://cybercrime.gov.in",
      isExternal: true,
      colorBg: "bg-sky-600 text-white shadow-sky-600/30 border-sky-500",
      btnBg: "bg-white text-sky-700 hover:bg-slate-100 font-black"
    },
    {
      id: 3,
      icon: Building2,
      title: em.card3?.title || "Call your Bank",
      desc: em.card3?.desc || "Contact your home bank customer care number immediately to report fraudulent money deduction.",
      actionText: em.card3?.actionText || "Check Bank Helpline Number",
      href: "tel:1930",
      isExternal: false,
      colorBg: "bg-indigo-600 text-white shadow-indigo-600/30 border-indigo-500",
      btnBg: "bg-white text-indigo-700 hover:bg-slate-100 font-black"
    },
    {
      id: 4,
      icon: Lock,
      title: em.card4?.title || "Block UPI & Mobile Banking",
      desc: em.card4?.desc || "Block your UPI PIN and freeze mobile banking app access to prevent further unauthorized transfers.",
      actionText: em.card4?.actionText || "Block UPI Access",
      href: "tel:1930",
      isExternal: false,
      colorBg: "bg-purple-600 text-white shadow-purple-600/30 border-purple-500",
      btnBg: "bg-white text-purple-700 hover:bg-slate-100 font-black"
    },
    {
      id: 5,
      icon: Camera,
      title: em.card5?.title || "Save Screenshot & UTR Number",
      desc: em.card5?.desc || "Take screenshots of debit SMS, transaction reference UTR numbers, WhatsApp chat messages, and fake links.",
      actionText: em.card5?.actionText || "Keep Evidence Ready",
      href: "#evidence",
      isExternal: false,
      colorBg: "bg-amber-600 text-white shadow-amber-600/30 border-amber-500",
      btnBg: "bg-white text-amber-800 hover:bg-slate-100 font-black"
    },
    {
      id: 6,
      icon: FileText,
      title: em.card6?.title || "Report Complaint at Police Station",
      desc: em.card6?.desc || "File a written complaint at your nearest Police Cyber Cell along with transaction bank statement copies.",
      actionText: em.card6?.actionText || "Locate Cyber Cell",
      href: "https://cybercrime.gov.in",
      isExternal: true,
      colorBg: "bg-emerald-600 text-white shadow-emerald-600/30 border-emerald-500",
      btnBg: "bg-white text-emerald-800 hover:bg-slate-100 font-black"
    },
    {
      id: 7,
      icon: AlertTriangle,
      title: em.card7?.title || "Warn Your Friends & Community",
      desc: em.card7?.desc || "Alert your family, friends, and village members about the scam number or link so others do not get trapped.",
      actionText: em.card7?.actionText || "Report Scam Number",
      href: "/report-scam",
      isExternal: false,
      colorBg: "bg-rose-600 text-white shadow-rose-600/30 border-rose-500",
      btnBg: "bg-white text-rose-800 hover:bg-slate-100 font-black"
    }
  ];

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-8">
        
        {/* Navigation */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>{em.backHome || "Back to Home"}</span>
        </button>

        {/* 🚨 Lost Money? Banner */}
        <div className="p-8 sm:p-10 bg-gradient-to-br from-red-600 via-rose-700 to-slate-950 text-white rounded-[28px] shadow-2xl space-y-6 border border-red-500/40 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-10 h-10 text-amber-300 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>{em.portalBadge || "National Cyber Emergency Portal"}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                  {em.heroTitle || "🚨 Lost Money?"}
                </h1>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-extrabold text-red-200">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>{em.goldenHourBadge || "Golden Hour Recovery (First 2 Hours)"}</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-950/80 backdrop-blur-md border border-red-500/40 text-center space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-6xl font-black tracking-wider text-white">
                {em.call1930Title || "Call 1930 Immediately"}
              </h2>
              <p className="text-xs sm:text-base font-bold text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {em.call1930Desc || "Calling 1930 within the first 2 hours of unauthorized money deduction gives an 85%+ success rate in freezing stolen funds across banking networks."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="tel:1930"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                <PhoneCall className="w-6 h-6 animate-pulse" />
                <span>{em.callNowBtn || "Call 1930 Now (Toll Free)"}</span>
              </a>

              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-2xl border border-white/20 transition-all"
              >
                <span>{em.reportGovBtn || "Report at cybercrime.gov.in"}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* 7 Large Colorful Emergency Action Cards Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            <span>{em.checklistTitle || "Immediate Emergency Steps Checklist:"}</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.id}
                  className={`p-6 rounded-[24px] border shadow-xl flex flex-col justify-between space-y-4 ${card.colorBg} transform hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                        <IconComp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-white leading-tight">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold opacity-95 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {card.isExternal ? (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${card.btnBg}`}
                    >
                      <span>{card.actionText}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : card.href.startsWith('/') ? (
                    <button
                      onClick={() => navigate(card.href)}
                      className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${card.btnBg}`}
                    >
                      <span>{card.actionText}</span>
                    </button>
                  ) : (
                    <a
                      href={card.href}
                      className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${card.btnBg}`}
                    >
                      <span>{card.actionText}</span>
                    </a>
                  )}
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

export default EmergencyPage;
