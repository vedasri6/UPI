import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  Bot, 
  QrCode, 
  CheckCircle, 
  AlertTriangle, 
  PhoneCall, 
  Award, 
  ArrowRight, 
  User, 
  Activity, 
  Sparkles,
  Settings,
  BarChart3,
  Link2,
  MessageSquare,
  Smartphone,
  BookOpen,
  Lock,
  MapPin,
  BellRing,
  Video
} from 'lucide-react';

export const DashboardPage = () => {
  const { t, language } = useLanguage();
  const { user, isAdmin } = useAuth();

  const d = t.dashboard || {};
  const nav = t.nav || {};
  const alertsObj = t.alerts || {};

  const userName = user?.name || user?.full_name || d.defaultUser || (language === 'te' ? 'జాగ్రత్తగల పౌరుడు' : 'Vigilant Citizen');

  const analyticsMetrics = [
    {
      title: language === 'te' ? "AI చాట్‌లు" : "AI Cyber Chats",
      value: "28 Queries",
      icon: Bot,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800"
    },
    {
      title: language === 'te' ? "క్యూఆర్ స్కాన్‌లు" : "QR Code Scans",
      value: "14 Checked",
      icon: QrCode,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800"
    },
    {
      title: language === 'te' ? "లింక్ విశ్లేషణలు" : "Link Risk Analyses",
      value: "19 Web Links",
      icon: Link2,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800"
    },
    {
      title: language === 'te' ? "SMS తనిఖీలు" : "SMS Fraud Tests",
      value: "11 Inspected",
      icon: MessageSquare,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800"
    },
    {
      title: language === 'te' ? "నమోదైన మోసాలు" : "Reported Scams",
      value: "5 Submitted",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800"
    },
    {
      title: language === 'te' ? "క్విజ్ స్కోరు" : "Quiz High Score",
      value: "95% (Passed)",
      icon: Award,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-bgDark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 1. LOGGED-IN USER IDENTITY SECTION */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-secondary rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-primary/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* User Details & Avatar */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Profile Avatar */}
              <div className="relative shrink-0">
                {user?.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={userName} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/80 shadow-xl bg-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl border border-white/30 uppercase">
                    {userName.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-primary flex items-center justify-center shadow-md" title="Active Protected Profile" />
              </div>

              {/* Name & Identity info */}
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 px-3 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black text-white uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{d.badge || "National Citizen Cyber Protection Portal"}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  {d.welcomeBack || "Welcome back"}, {userName}!
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-100 font-bold">
                  {user?.village && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-300" />
                      {user.village}{user.district ? `, ${user.district}` : ''}
                    </span>
                  )}
                  {user?.email && (
                    <span className="opacity-90 font-mono text-[11px]">({user.email})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile & Admin Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl text-xs transition-all shadow-lg flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-slate-900" />
                  <span>{d.adminCenter || "Admin Control Center"}</span>
                </Link>
              )}
              <Link
                to="/profile"
                className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-black rounded-2xl text-xs transition-all backdrop-blur-md flex items-center gap-2 border border-white/30"
              >
                <User className="w-4 h-4" />
                <span>{d.profile || "Security Profile"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. OVERALL SAFETY & STATUS AREA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase">{d.cyberSafetyScore || "Cyber Safety Score"}</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">95 / 100</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
            <div className="p-3.5 bg-primary/10 rounded-2xl text-primary dark:text-sky-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase">{d.citizenStatus || "Protection Status"}</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {user?.is_verified ? (d.verifiedCitizen || 'Verified Citizen') : (d.activeUser || 'Active Vigilant User')}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
            <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-500">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <span className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase">{d.scamsBlocked || "Total Scams Blocked"}</span>
              <span className="text-2xl font-black text-amber-500">{d.scamsCount || "14 Scams"}</span>
            </div>
          </div>

          <a
            href="tel:1930"
            className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="block text-[11px] font-black text-red-200 uppercase">{d.cyberEmergency || "Cyber Emergency"}</span>
                <span className="text-2xl font-black">{d.dial1930 || "Dial 1930"}</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 3. IMPORTANT QUICK SAFETY ACTIONS: 6 CORE ACTIONS */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-primary to-slate-900 text-white rounded-3xl shadow-xl space-y-5 border border-blue-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/20 pb-4">
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-300" />
              <span>{language === 'te' ? "ముఖ్యమైన భద్రతా చర్యలు (Quick Safety Actions)" : "Essential Safety Actions"}</span>
            </h2>
            <span className="text-xs text-slate-200 font-bold">
              {language === 'te' ? "సులభమైన రక్షణ సేవలు" : "Quick access for all citizens"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. AI Fraud Assistant */}
            <Link
              to="/ai-assistant"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 flex flex-col items-center text-center space-y-2 transition-all hover:scale-105 group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/30 text-blue-300 flex items-center justify-center">
                <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-black leading-tight">{language === 'te' ? "AI అసిస్టెంట్" : "AI Assistant"}</span>
            </Link>

            {/* 2. Check Suspicious Link */}
            <Link
              to="/ai-assistant"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 flex flex-col items-center text-center space-y-2 transition-all hover:scale-105 group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-500/30 text-purple-300 flex items-center justify-center">
                <Link2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-black leading-tight">{language === 'te' ? "లింక్ తనిఖీ" : "Check Link"}</span>
            </Link>

            {/* 3. Report Fraud */}
            <Link
              to="/report-scam"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 flex flex-col items-center text-center space-y-2 transition-all hover:scale-105 group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-black leading-tight">{language === 'te' ? "మోసం రిపోర్ట్" : "Report Fraud"}</span>
            </Link>

            {/* 4. Practice UPI */}
            <Link
              to="/practice-upi"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 flex flex-col items-center text-center space-y-2 transition-all hover:scale-105 group"
            >
              <div className="w-11 h-11 rounded-xl bg-sky-500/30 text-sky-300 flex items-center justify-center">
                <Smartphone className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-black leading-tight">{language === 'te' ? "యూపీఐ ప్రాక్టీస్" : "Practice UPI"}</span>
            </Link>

            {/* 5. Safety Videos */}
            <Link
              to="/security-protocols"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 flex flex-col items-center text-center space-y-2 transition-all hover:scale-105 group"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center">
                <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-black leading-tight">{language === 'te' ? "భద్రతా వీడియోలు" : "Safety Videos"}</span>
            </Link>

            {/* 6. Call 1930 */}
            <a
              href="tel:1930"
              className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl border border-red-500 flex flex-col items-center text-center space-y-2 transition-all hover:scale-105 group shadow-lg"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center animate-pulse">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-xs font-black leading-tight">{language === 'te' ? "1930 కాల్" : "Call 1930"}</span>
            </a>
          </div>
        </div>

        {/* 4. MAIN PROTECTION TOOLS GRID */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-secondary" />
            <span>{d.interactiveTools || "Interactive Cyber Tools"}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link to="/practice-upi" className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-3 hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center font-black">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {nav.practiceUpi || "Practice UPI Simulator"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                {d.practiceUpiDesc || "Practice UPI payments safely without using real money."}
              </p>
            </Link>

            <Link to="/ai-assistant" className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-3 hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-sky-400 flex items-center justify-center font-black">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {nav.aiAssistant || "AI Cyber Assistant"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                {d.aiAssistantDesc || "Ask questions about UPI PIN, OTP safety, or calls."}
              </p>
            </Link>

            <Link to="/upi-verifier" className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-3 hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {nav.upiVerifier || "UPI ID Verifier"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                {d.upiVerifierDesc || "Check receiver handles against reported scam database."}
              </p>
            </Link>

            <Link to="/qr-scanner" className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-3 hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {nav.qrScanner || "QR Code Scanner"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                {d.qrScannerDesc || "Inspect payment QR codes before transferring money."}
              </p>
            </Link>

            <Link to="/report-scam" className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-3 hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {nav.communityReports || "Report Fake Number"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                {d.reportScamDesc || "Report fake caller numbers or UPI IDs to protect your area."}
              </p>
            </Link>

            <Link to="/quiz" className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-3 hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {nav.quiz || "Safety Awareness Quiz"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                {d.quizDesc || "Take safety quiz and get certified citizen badge."}
              </p>
            </Link>

          </div>
        </div>

        {/* 5. AWARENESS & LEARNING SECTION */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span>{d.awarenessLearning || "Awareness & Training"}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/scams" className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-3 hover:border-amber-400 transition-all">
              <BookOpen className="w-8 h-8 text-amber-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {nav.scamTypes || "Scam Types & Prevention"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {d.scamTypesDesc || "Learn common cyber fraud methods and how to stay safe."}
              </p>
            </Link>

            <Link to="/security-protocols" className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-3 hover:border-purple-400 transition-all">
              <Lock className="w-8 h-8 text-purple-600" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {nav.securityProtocols || "Security Protocols"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {d.protocolsDesc || "Official NPCI & RBI rules for digital payment security."}
              </p>
            </Link>

            <Link to="/awareness-hub" className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-3 hover:border-blue-400 transition-all">
              <Award className="w-8 h-8 text-blue-600" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {nav.awarenessHub || "Voice & Video Hub"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {language === 'te' ? "వాయిస్ & వీడియో ద్వారా సులభంగా అవగాహన పొందండి." : "Listen to voice guides and watch animated safety videos."}
              </p>
            </Link>
          </div>
        </div>

        {/* 6. PERSONAL SECURITY ANALYTICS */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span>{d.personalAnalytics || "Personal Security Analytics"}</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analyticsMetrics.map((metric, idx) => {
              const IconComp = metric.icon;
              return (
                <div key={idx} className={`p-4 rounded-2xl border ${metric.color} space-y-2 shadow-sm`}>
                  <IconComp className="w-6 h-6" />
                  <span className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">{metric.title}</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{metric.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. LIVE REGIONAL ALERTS SNIPPET */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-red-500" />
              <span>{d.recentAlerts || "Live Regional Alerts"}</span>
            </h2>
            <Link to="/alerts" className="text-xs font-black text-primary dark:text-sky-400 hover:underline flex items-center gap-1">
              <span>{d.viewAllAlerts || "View All Alerts"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase">
                {alertsObj.criticalAlert || "CRITICAL ALERT"}
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'te' ? "నకిలీ కరెంట్ బిల్లు పవర్ కట్ SMS స్కామ్" : "Fake Electricity Bill Disconnection SMS Scam"}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 font-semibold">
                {language === 'te' ? "తెలంగాణ & ఆంధ్రప్రదేశ్ ప్రాంతాలలో తీవ్రంగా జరుగుతున్న మోసం. ఫోన్ కాల్స్ చేయవద్దు." : "SMS claiming power disconnection tonight. DO NOT CALL OR CLICK LINKS."}
              </p>
            </div>
            <Link to="/alerts" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shrink-0 text-center">
              {language === 'te' ? "వివరాలు చూడండి" : "View Details"}
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
