import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  DownloadCloud, 
  CheckCircle2, 
  QrCode, 
  PhoneCall, 
  AlertTriangle,
  ChevronRight,
  X
} from 'lucide-react';

export const ScamAwarenessSection = () => {
  const { t } = useLanguage();
  const [activeModalScam, setActiveModalScam] = useState(null);

  const sc = t?.scamCards || {};

  // 7 Cyber Safety Cards dynamically configured with localized content & icons
  const safetyCards = [
    {
      id: 1,
      icon: KeyRound,
      title: sc.card1?.title || "Never Share OTP",
      desc: sc.card1?.desc || "One Time Password (OTP) is your secret key to approve bank transfers. Bank staff or officers will NEVER ask for your OTP.",
      tip: sc.card1?.tip || "Golden Rule: Never share 6-digit OTP with anyone on phone calls or WhatsApp.",
      cardBg: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-950 dark:text-red-200",
      iconBg: "bg-red-600 text-white shadow-red-500/30"
    },
    {
      id: 2,
      icon: Lock,
      title: sc.card2?.title || "Never Share UPI PIN",
      desc: sc.card2?.desc || "Your secret UPI PIN is required ONLY to SEND money out of your account, NEVER to receive money into your account.",
      tip: sc.card2?.tip || "Golden Rule: Entering UPI PIN ALWAYS deducts money from your bank account.",
      cardBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200",
      iconBg: "bg-amber-500 text-white shadow-amber-500/30"
    },
    {
      id: 3,
      icon: ShieldCheck,
      title: sc.card3?.title || "Banks Never Ask Password",
      desc: sc.card3?.desc || "Official banks, RBI, or police officers will NEVER call you to ask for your netbanking passwords, PIN, or CVV number.",
      tip: sc.card3?.tip || "Golden Rule: Disconnect calls from anyone claiming to be a bank manager asking for passwords.",
      cardBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200",
      iconBg: "bg-blue-600 text-white shadow-blue-500/30"
    },
    {
      id: 4,
      icon: DownloadCloud,
      title: sc.card4?.title || "Do Not Install Unknown Apps",
      desc: sc.card4?.desc || "Scammers send fake APK files or screen sharing apps (like AnyDesk, TeamViewer) over WhatsApp pretending to update your app.",
      tip: sc.card4?.tip || "Golden Rule: Install apps ONLY from official Google Play Store or Apple App Store.",
      cardBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200",
      iconBg: "bg-emerald-600 text-white shadow-emerald-500/30"
    },
    {
      id: 5,
      icon: CheckCircle2,
      title: sc.card5?.title || "Verify Before Paying",
      desc: sc.card5?.desc || "Always check the full registered account holder name displayed on your banking screen before entering your UPI PIN.",
      tip: sc.card5?.tip || "Golden Rule: Check carefully before sending money.",
      cardBg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200",
      iconBg: "bg-purple-600 text-white shadow-purple-500/30"
    },
    {
      id: 6,
      icon: QrCode,
      title: sc.card6?.title || "Check QR Carefully",
      desc: sc.card6?.desc || "Scammers send QR codes claiming: 'Scan QR code to receive cashback or prize money'. Receiving money needs NO QR scan.",
      tip: sc.card6?.tip || "Golden Rule: Scanning a QR code ALWAYS transfers money OUT of your account.",
      cardBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200",
      iconBg: "bg-indigo-600 text-white shadow-indigo-500/30"
    },
    {
      id: 7,
      icon: PhoneCall,
      title: sc.card7?.title || "Call 1930 Immediately",
      desc: sc.card7?.desc || "If money was fraudulently deducted from your bank account, call National Cyber Crime Helpline 1930 within 2 hours.",
      tip: sc.card7?.tip || "Golden Rule: Calling 1930 within the Golden Hour freezes stolen money immediately.",
      cardBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200",
      iconBg: "bg-rose-600 text-white shadow-rose-500/30"
    }
  ];

  return (
    <section id="scams" className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-950/60 text-danger dark:text-red-400 text-xs font-black uppercase tracking-wider border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-4 h-4" />
            <span>{sc.safetyBadge || "Essential Cyber Safety Cards"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {sc.title || "Recognize & Avoid Cyber Scams"}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-bold">
            {sc.subtitle || "Simple, easy-to-read safety cards for village citizens, seniors, students, and farmers."}
          </p>
        </div>

        {/* 7 Cyber Safety Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {safetyCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.id}
                className="group relative p-6 bg-slate-50 dark:bg-slate-800/90 rounded-[24px] border border-slate-200/90 dark:border-slate-700/90 hover:border-primary shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${card.iconBg} shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComp className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-snug">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed mb-4">
                    {card.desc}
                  </p>

                  <div className={`p-4 rounded-2xl border ${card.cardBg} mb-6 shadow-sm`}>
                    <p className="text-xs font-extrabold leading-snug">
                      {card.tip}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalScam(card)}
                  className="w-full py-3 px-4 bg-white dark:bg-slate-900 hover:bg-primary hover:text-white text-slate-900 dark:text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
                >
                  <span>{sc.learnMore || "Read Protection Guide"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Details Modal */}
        {activeModalScam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6">
              
              <button
                onClick={() => setActiveModalScam(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 dark:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeModalScam.iconBg} shrink-0`}>
                  <activeModalScam.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {activeModalScam.title}
                  </h3>
                  <span className="text-xs text-danger font-black uppercase">
                    {sc.criticalNotice || "Critical Security Notice"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
                {activeModalScam.desc}
              </p>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-extrabold">
                  {activeModalScam.tip}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <a
                  href="tel:1930"
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2"
                >
                  {sc.callHelpline || "Call Helpline 1930"}
                </a>
                <button
                  onClick={() => setActiveModalScam(null)}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black"
                >
                  {sc.close || "Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScamAwarenessSection;
