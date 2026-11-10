import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  UserCheck, 
  Building2, 
  KeyRound, 
  Eye, 
  Calculator, 
  CheckCircle2, 
  Receipt, 
  PhoneCall,
  Sparkles,
  HelpCircle,
  ChevronDown,
  AlertTriangle,
  XCircle,
  Award,
  Globe,
  Bot,
  QrCode,
  Users,
  Lock,
  ArrowRight,
  Info,
  X,
  Radio,
  FileCode,
  Laptop
} from 'lucide-react';

export const AboutPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedFraudModal, setSelectedFraudModal] = useState(null);

  const abt = t.aboutPage || {};

  // Icons mapping for 12 common frauds
  const fraudIcons = [
    KeyRound,      // 1. OTP
    ShieldAlert,   // 2. UPI PIN
    QrCode,        // 3. QR Code
    PhoneCall,     // 4. Fake Care
    Award,         // 5. Lottery
    FileCode,      // 6. APK
    Laptop,        // 7. Remote Access
    Eye,           // 8. Screen Sharing
    Smartphone,    // 9. WhatsApp
    UserCheck,     // 10. Fake KYC
    Sparkles,      // 11. Cashback
    Radio          // 12. SIM Swap
  ];

  // 10 Safety Rules with ❌
  const safetyRules = [
    "Never share your OTP with anyone, including bank callers.",
    "Never enter your UPI PIN to receive money into your account.",
    "Never click unknown SMS, bit.ly, or WhatsApp web links.",
    "Never install APK files sent via WhatsApp attachments.",
    "Download apps ONLY from Google Play Store or Apple App Store.",
    "Never trust lottery, KBC, or advance processing fee messages.",
    "Bank managers & police NEVER ask for PIN, OTP, or CVV.",
    "Receiving money NEVER requires scanning a QR code.",
    "Never install AnyDesk or TeamViewer when asked by strangers.",
    "Always verify the receiver's full registered name before sending money."
  ];

  // 15 FAQs list fallback for seamless multi-language state
  const defaultFaqs = [
    {
      q: "What is UPI?",
      a: "Unified Payments Interface (UPI) is a real-time instant payment system developed by NPCI that allows instant money transfers between bank accounts using a smartphone."
    },
    {
      q: "Is UPI safe for daily transactions?",
      a: "Yes, UPI uses bank-grade encryption and two-factor authentication. However, safety depends on keeping your secret UPI PIN and OTP confidential at all times."
    },
    {
      q: "Can someone steal money using OTP?",
      a: "Yes! OTP is your digital signature for approving bank debits. If shared with anyone, fraudsters can drain your bank account within seconds."
    },
    {
      q: "What should I do if I scan a fake QR code?",
      a: "If you scanned a QR code and money was deducted, do NOT enter your PIN again. Block your UPI app immediately, report to your bank, and call helpline 1930."
    },
    {
      q: "How do I report cyber fraud?",
      a: "Call the toll-free helpline 1930 immediately within 2 hours or file a complaint online at www.cybercrime.gov.in."
    },
    {
      q: "What is Cyber Crime Helpline 1930?",
      a: "1930 is the official 24x7 National Cyber Crime Reporting Helpline operated by the Ministry of Home Affairs to freeze stolen funds in fraud cases."
    },
    {
      q: "Is UPI PIN needed to receive money?",
      a: "NO! UPI PIN is NEVER required to receive money into your bank account. PIN is only needed to SEND or transfer money."
    },
    {
      q: "What happens if I install an APK file from WhatsApp?",
      a: "Malicious APK files install spyware on your phone, allowing hackers to read your SMS, steal passwords, and control your device remotely."
    },
    {
      q: "Why do fraudsters ask for screen sharing apps like AnyDesk?",
      a: "Screen sharing apps allow scammers to view your phone screen live in real-time, enabling them to steal your UPI PIN and banking passwords as you type."
    },
    {
      q: "How can I identify fake customer care numbers?",
      a: "Never trust helpline numbers found on Google search or social media. Always check numbers listed inside official bank apps or back of debit cards."
    },
    {
      q: "Can banks call asking for my debit card details or OTP?",
      a: "NEVER. Bank employees, RBI officers, and police will never ask for your card details, CVV, OTP, or UPI PIN under any circumstances."
    },
    {
      q: "What is the Golden Hour in cyber fraud recovery?",
      a: "The Golden Hour refers to the first 2 hours after a cyber fraud occurs. Calling 1930 during this window gives police highest success in freezing funds."
    },
    {
      q: "How does UPI Suraksha Mitra protect village citizens?",
      a: "We provide audio/video guides in regional languages, real-time district scam warnings, AI verification tools, and community reporting networks."
    },
    {
      q: "What should I do if my SIM card suddenly stops working?",
      a: "If your SIM loses signal unexpectedly for hours, contact your telecom operator immediately to check for unauthorised SIM Swap fraud."
    },
    {
      q: "How can I check if a UPI ID is fake or reported for fraud?",
      a: "Use our UPI ID Verifier tool to query handles against national cyber crime complaint databases before completing any payment."
    }
  ];

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow space-y-16 py-10">
        
        {/* ==================================================== */}
        {/* SECTION 1 – HERO SECTION */}
        {/* ==================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-secondary rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-white border border-white/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>{abt.heroBadge || "National Cyber Security Initiative"}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  {abt.heroTitle || "About UPI Suraksha Mitra"}
                </h1>

                <p className="text-base sm:text-lg text-slate-100 opacity-95 leading-relaxed font-medium">
                  {abt.heroSubtitle || "Protecting Every Digital Payment Through Awareness, Education and Community Support."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#mission"
                    className="px-6 py-3.5 bg-white text-primary hover:bg-slate-100 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>Read Our Mission</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="tel:1930"
                    className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 border border-red-400 animate-pulse"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Cyber Helpline 1930</span>
                  </a>
                </div>
              </div>

              {/* Cybersecurity Modern Graphic Badge */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-square bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-amber-300/80 shadow-inner">
                    <ShieldCheck className="w-14 h-14 text-amber-300" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-widest block">
                      Citizen Defense Shield
                    </span>
                    <h3 className="text-lg font-black text-white">
                      500,000+ Villages Network
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full pt-2">
                    <div className="p-2 bg-white/10 rounded-xl text-[10px] font-extrabold text-white text-center border border-white/10">
                      🔒 PIN Guard
                    </div>
                    <div className="p-2 bg-white/10 rounded-xl text-[10px] font-extrabold text-white text-center border border-white/10">
                      📱 App Verification
                    </div>
                    <div className="p-2 bg-white/10 rounded-xl text-[10px] font-extrabold text-white text-center border border-white/10">
                      🚨 1930 Alert
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </section>


        {/* ==================================================== */}
        {/* SECTION 2 & 3 – MISSION & VISION */}
        {/* ==================================================== */}
        <section id="mission" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* OUR MISSION CARD */}
            <div className="p-8 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 relative overflow-hidden group hover:border-primary transition-all">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary dark:text-secondary flex items-center justify-center border border-primary/20">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {abt.missionTitle || "Our Mission"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {abt.missionDesc || "Empowering every citizen—especially village communities, students, senior citizens, farmers, and small shopkeepers—with accessible digital safety knowledge, real-time AI scam detection, and instant emergency response to eliminate UPI payment fraud."}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-primary dark:text-secondary">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">🌾 Village Communities</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">👴 Senior Citizens</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">🏪 Shopkeepers</span>
              </div>
            </div>

            {/* OUR VISION CARD */}
            <div className="p-8 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 relative overflow-hidden group hover:border-secondary transition-all">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20">
                <Globe className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {abt.visionTitle || "Our Vision"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {abt.visionDesc || "To build a fraud-free digital India where every citizen across 500,000+ villages can confidently use UPI, digital wallets, and online banking without the fear of trickery or financial exploitation."}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-full">🇮🇳 Digital India</span>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-full">🛡️ 100% Secure Payments</span>
              </div>
            </div>

          </div>
        </section>


        {/* ==================================================== */}
        {/* SECTION 4 – WHY THIS PLATFORM */}
        {/* ==================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {abt.whyTitle || "Why This Platform Was Built"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
              {abt.whySubtitle || "Addressing the growing threats in India's digital payment revolution."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const cardData = abt.whyCards?.[`c${i}Title`] ? {
                title: abt.whyCards[`c${i}Title`],
                desc: abt.whyCards[`c${i}Desc`]
              } : {
                title: `Cyber Threat Area #${i}`,
                desc: "Addressing cyber risks to protect citizens across semi-urban and rural areas."
              };

              return (
                <div
                  key={i}
                  className="p-6 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-lg space-y-3 hover:-translate-y-1 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 font-black text-sm flex items-center justify-center border border-amber-500/20">
                    #{i}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {cardData.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {cardData.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>


        {/* ==================================================== */}
        {/* SECTION 5 – COMMON UPI FRAUDS (12 Interactive Cards) */}
        {/* ==================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-black uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>Fraud Awareness Encyclopedia</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {abt.commonFraudsTitle || "Recognize 12 Common Cyber Scams"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
              {abt.commonFraudsSubtitle || "Detailed breakdown, warning signs, and prevention guidelines for every citizen."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(abt.frauds || []).map((fraud, idx) => {
              const IconComp = fraudIcons[idx % fraudIcons.length];
              return (
                <div
                  key={fraud.id || idx}
                  className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col justify-between space-y-4 hover:border-primary transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3.5 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-secondary border border-primary/20">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 rounded-md">
                        High Risk
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                      {fraud.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {fraud.desc}
                    </p>

                    {/* Quick Warnings Preview */}
                    <div className="p-3 bg-red-50/60 dark:bg-red-950/30 rounded-xl space-y-1 border border-red-100 dark:border-red-900/40">
                      <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 block">
                        {abt.warningsHeader || "Warning Signs:"}
                      </span>
                      <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside font-semibold">
                        {(fraud.warnings || []).slice(0, 2).map((w, wi) => (
                          <li key={wi}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFraudModal(fraud)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white dark:hover:bg-secondary dark:hover:text-slate-900 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Info className="w-4 h-4" />
                    <span>{abt.learnMoreModalBtn || "View Protection Guide"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>


        {/* ==================================================== */}
        {/* SECTION 6 – SAFE UPI GUIDE (10-Step Timeline) */}
        {/* ==================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {abt.timelineTitle || "10-Step Safe UPI Protocol"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
              {abt.timelineSubtitle || "Follow this official security protocol for safe digital payments."}
            </p>
          </div>

          <div className="space-y-4">
            {[
              "1. Download official UPI app from Google Play Store or Apple App Store.",
              "2. Link your bank account with your registered mobile number.",
              "3. Create a unique, secret 4 or 6 digit UPI PIN.",
              "4. Verify the receiver's full registered name on screen before entering PIN.",
              "5. Check the exact payment amount displayed before confirming.",
              "6. Never share your OTP with anyone.",
              "7. Never enter your UPI PIN to receive money into your account.",
              "8. Save transaction receipt or reference number (UTR).",
              "9. Report suspicious activity immediately to bank and police.",
              "10. Call Cyber Crime Helpline 1930 if money is lost within golden hour."
            ].map((stepText, idx) => (
              <div
                key={idx}
                className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-4 hover:border-primary transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  {stepText}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* ==================================================== */}
        {/* SECTION 7 – SAFETY CARDS (10 Security Don'ts) */}
        {/* ==================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {abt.safetyRulesTitle || "10 Essential Security Don'ts (❌)"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
              {abt.safetyRulesSubtitle || "Memorize these critical rules to safeguard your hard-earned money."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {safetyRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-5 bg-red-50/80 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-md space-y-2 text-center flex flex-col items-center justify-center"
              >
                <XCircle className="w-8 h-8 text-red-500" />
                <p className="text-xs font-extrabold text-red-900 dark:text-red-200 leading-snug">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* ==================================================== */}
        {/* SECTION 8 – GOVERNMENT SUPPORT */}
        {/* ==================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl space-y-8 border border-slate-800">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/40">
                Official Regulatory Support
              </span>
              <h2 className="text-2xl sm:text-4xl font-black">
                {abt.govTitle || "Government & National Security Framework"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {abt.govSubtitle || "Supported by official national cyber safety initiatives."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { title: abt.govCards?.rbiTitle || "RBI Guidelines", desc: abt.govCards?.rbiDesc || "Reserve Bank mandated two-factor authentication." },
                { title: abt.govCards?.npciTitle || "NPCI Security", desc: abt.govCards?.npciDesc || "End-to-end bank encryption for all UPI payments." },
                { title: abt.govCards?.digitalTitle || "Digital India", desc: abt.govCards?.digitalDesc || "National campaign for rural digital safety literacy." },
                { title: abt.govCards?.portalTitle || "Cyber Portal", desc: abt.govCards?.portalDesc || "cybercrime.gov.in official reporting database." },
                { title: abt.govCards?.helplineTitle || "Helpline 1930", desc: abt.govCards?.helplineDesc || "Toll-free 24x7 emergency golden hour response." }
              ].map((g, idx) => (
                <div key={idx} className="p-5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-center">
                  <Award className="w-6 h-6 text-amber-400 mx-auto" />
                  <h4 className="text-xs font-black text-amber-300">{g.title}</h4>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ==================================================== */}
        {/* SECTION 9 – FAQ (15 Interactive Accordion Questions) */}
        {/* ==================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-secondary text-xs font-bold uppercase">
              <HelpCircle className="w-4 h-4" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {abt.faqTitle || "Frequently Asked Questions (FAQ)"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
              {abt.faqSubtitle || "Find answers to 15 common queries about digital payment safety and fraud prevention."}
            </p>
          </div>

          <div className="space-y-3">
            {defaultFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:text-secondary text-xs font-black flex items-center justify-center shrink-0">
                        Q{idx + 1}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>


        {/* ==================================================== */}
        {/* SECTION 10 – CALL TO ACTION */}
        {/* ==================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 bg-gradient-to-r from-slate-900 via-primary to-slate-900 rounded-3xl text-white shadow-2xl text-center space-y-6 relative overflow-hidden border border-slate-800">
            <div className="max-w-2xl mx-auto space-y-3 relative z-10">
              <h2 className="text-2xl sm:text-4xl font-black">
                {abt.ctaTitle || "Protect Yourself & Your Community"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                {abt.ctaSubtitle || "Explore our safety tools, verify suspicious numbers, or call 1930 immediately."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
              <Link
                to="/#features"
                className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>{abt.btnLearnMore || "Explore Safety Tools"}</span>
              </Link>

              <Link
                to="/ai-assistant"
                className="px-6 py-3.5 bg-secondary hover:bg-emerald-600 text-slate-900 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>{abt.btnAiAssistant || "Launch AI Assistant"}</span>
              </Link>

              <Link
                to="/report-scam"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{abt.btnReportScam || "Report Scam Number"}</span>
              </Link>

              <a
                href="tel:1930"
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 animate-bounce"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{abt.btnEmergencyHelp || "Emergency Call 1930"}</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ==================================================== */}
      {/* FRAUD PROTECTION MODAL */}
      {/* ==================================================== */}
      {selectedFraudModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setSelectedFraudModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded-full">
                Fraud Safety Protocol
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {selectedFraudModal.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {selectedFraudModal.desc}
              </p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl space-y-2 border border-red-200 dark:border-red-900/60">
              <h4 className="text-xs font-black text-red-600 dark:text-red-400 uppercase">
                {abt.warningsHeader || "Warning Signs:"}
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside font-semibold">
                {(selectedFraudModal.warnings || []).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl space-y-2 border border-emerald-200 dark:border-emerald-900/60">
              <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase">
                {abt.preventionHeader || "Prevention Guidelines:"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-bold leading-relaxed">
                {selectedFraudModal.prevention}
              </p>
            </div>

            <button
              onClick={() => setSelectedFraudModal(null)}
              className="w-full py-3 bg-primary hover:bg-primary-light text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              Close Protection Guide
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AboutPage;
