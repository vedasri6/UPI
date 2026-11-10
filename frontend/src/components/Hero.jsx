import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  QrCode, 
  Smartphone, 
  AlertTriangle,
  Sparkles, 
  Shield, 
  Zap, 
  Bot, 
  ExternalLink,
  Video,
  Link2,
  ShieldAlert
} from 'lucide-react';

export const Hero = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const hero = t.hero || {};

  return (
    <section id="home" className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-slate-50 dark:bg-bgDark transition-colors">
      
      {/* Decorative Radial Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/10 via-emerald-500/10 to-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Top Announcement Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2 rounded-full bg-white dark:bg-slate-900 border border-primary/20 shadow-md text-primary dark:text-sky-300 text-xs sm:text-sm font-black">
            <Shield className="w-4 h-4 text-secondary fill-secondary/20" />
            <span>{hero.badge || 'National Citizen Cyber Security Portal'}</span>
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Title & Headline */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              {hero.title || 'Community UPI Fraud Prevention & Awareness Platform'}
            </h1>

            <p className="text-base sm:text-xl text-slate-700 dark:text-slate-200 font-bold leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {hero.subtitle || 'Simple, friendly cyber safety portal for village people, farmers, senior citizens, students, and first-time smartphone users across India.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              
              <button
                onClick={() => navigate('/ai-assistant')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-light text-white text-base font-black px-8 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <Bot className="w-5 h-5 text-amber-300" />
                <span>{hero.askAi || 'Ask AI Assistant'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/upi-verifier')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-900 dark:text-white text-base font-black px-7 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span>{hero.verifyUpi || 'Verify UPI Handle'}</span>
              </button>

              <a
                href="tel:1930"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-red-600 hover:bg-red-700 text-white text-base font-black px-7 py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 animate-pulse-subtle"
              >
                <PhoneCall className="w-5 h-5" />
                <span>{hero.emergencyHelp || 'Call 1930'}</span>
              </a>
            </div>

            {/* Prominent Large Emergency Section */}
            <div className="p-6 sm:p-8 rounded-[24px] bg-gradient-to-r from-red-950 via-red-900 to-slate-950 text-white text-left space-y-4 shadow-2xl border border-red-800 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-red-300 block mb-1">
                    {hero.badge || 'National Emergency Helpline'}
                  </span>
                  <div className="text-3xl sm:text-5xl font-black tracking-wider text-white">
                    {hero.helplineTitle || 'Emergency Helpline 1930'}
                  </div>
                </div>

                <a
                  href="tel:1930"
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-2xl shadow-xl flex items-center gap-2 shrink-0 animate-bounce"
                >
                  <PhoneCall className="w-6 h-6" />
                  <span>📞 {hero.callNow || 'Call Now'}</span>
                </a>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed border-t border-red-800/80 pt-3">
                {hero.helplineDesc || 'If you lost money through online fraud, call 1930 immediately.'}
              </p>

              <div className="pt-1 flex items-center gap-2 text-xs font-extrabold text-sky-300">
                <span>{hero.reportCrimeAt || 'Report cyber crime at:'}</span>
                <a 
                  href="https://cybercrime.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-white flex items-center gap-1"
                >
                  cybercrime.gov.in
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Trust Points */}
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-secondary" /> {hero.trust1 || '100% Free Public Platform'}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-secondary" /> {hero.trust2 || 'English & తెలుగు Support'}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-secondary" /> {hero.trust3 || 'Easy for Senior Citizens & Farmers'}
              </span>
            </div>
          </div>

          {/* Right Column: Dynamic Interactive Canvas */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            <div className="relative w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-black text-primary dark:text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-secondary" /> {hero.liveShield || 'Live Safety Shield'}
                </span>
              </div>

              {/* Dynamic Security Visual Canvas */}
              <div className="relative bg-slate-950 text-white rounded-2xl p-6 overflow-hidden space-y-4 shadow-inner border border-slate-800">
                
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                <div 
                  onClick={() => navigate('/upi-verifier')}
                  className="group flex items-center gap-3.5 p-3.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-emerald-500/50 shadow-lg cursor-pointer transition-all"
                >
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-black text-emerald-400 flex items-center justify-between">
                      <span>{hero.upiVerificationActive || 'UPI Verification Active'}</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold">{hero.checkPayee || 'Check payee name carefully before sending money.'}</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/ai-assistant')}
                  className="group flex items-center gap-3.5 p-3.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-amber-500/50 shadow-lg cursor-pointer transition-all"
                >
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-black text-amber-400 flex items-center justify-between">
                      <span>{hero.phishingInspection || 'Phishing Link Inspection'}</span>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold">{hero.highRisk || 'HIGH RISK'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold truncate">http://bit.ly/power-pay</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/qr-scanner')}
                  className="group flex items-center gap-3.5 p-3.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-sky-500/50 shadow-lg cursor-pointer transition-all"
                >
                  <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-black text-sky-400 flex items-center justify-between">
                      <span>{hero.qrSafeguard || 'QR Code Scanner Safeguard'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold">{hero.qrDeducts || 'Scanning QR ALWAYS deducts money!'}</p>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400 pt-1">
                <span>{hero.npciCompliant || 'NPCI Guidelines Compliant'}</span>
                <span>{hero.active24x7 || 'Active 24x7'}</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* Important Quick Actions Hub: 6 Core Elder-Friendly Cyber Protection Tools  */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary dark:text-sky-400" />
              <span>{language === 'te' ? "ముఖ్యమైన భద్రతా సేవలు (Important Quick Actions)" : "Essential Cyber Safety Actions"}</span>
            </h2>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'te' ? "అన్ని వయసుల వారికి సులభమైన రక్షణ సాధనాలు" : "Elder-friendly tools for instant fraud protection"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. AI Fraud Assistant */}
            <Link
              to="/ai-assistant"
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl hover:border-primary transition-all flex items-start gap-4 group"
              aria-label="Open AI Fraud Assistant"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{language === 'te' ? "AI ఫ్రాడ్ అసిస్టెంట్" : "AI Fraud Assistant"}</span>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  {language === 'te' ? "అనుమానాస్పద మెసేజ్ లేదా లింక్ గురించి అడగండి" : "Verify suspicious messages, calls, & links"}
                </p>
              </div>
            </Link>

            {/* 2. Check Suspicious Link */}
            <Link
              to="/ai-assistant"
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl hover:border-purple-600 transition-all flex items-start gap-4 group"
              aria-label="Check Suspicious Link"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Link2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors flex items-center justify-between">
                  <span>{language === 'te' ? "అనుమానాస్పద లింక్ తనిఖీ" : "Check Suspicious Link"}</span>
                  <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  {language === 'te' ? "బ్యాంకింగ్ లింకులను నొక్కే ముందే తనిఖీ చేయండి" : "Analyze suspicious URLs before clicking"}
                </p>
              </div>
            </Link>

            {/* 3. Report Fraud */}
            <Link
              to="/report-scam"
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl hover:border-emerald-600 transition-all flex items-start gap-4 group"
              aria-label="Report Fraud"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                  <span>{language === 'te' ? "సైబర్ మోసాన్ని నివేదించండి" : "Report Fraud"}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  {language === 'te' ? "నకిలీ నంబర్లు & ఫేక్ UPI ఐడీలను రిపోర్ట్ చేయండి" : "Report scam phone numbers & fake UPI handles"}
                </p>
              </div>
            </Link>

            {/* 4. Practice UPI */}
            <Link
              to="/practice-upi"
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-sky-200 dark:border-sky-800 shadow-lg hover:shadow-xl hover:border-sky-600 transition-all flex items-start gap-4 group"
              aria-label="Practice UPI payments safely"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors flex items-center justify-between">
                  <span>{language === 'te' ? "యూపీఐ ప్రాక్టీస్ చేయండి" : "Practice UPI"}</span>
                  <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  {language === 'te' ? "డబ్బులు పోకుండా సురక్షితంగా పేమెంట్స్ నేర్చుకోండి" : "Simulate safe UPI transfers without real money"}
                </p>
              </div>
            </Link>

            {/* 5. Safety Videos */}
            <Link
              to="/security-protocols"
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl hover:border-amber-600 transition-all flex items-start gap-4 group"
              aria-label="View Cyber Safety Videos"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors flex items-center justify-between">
                  <span>{language === 'te' ? "భద్రతా వీడియోలు" : "Safety Videos"}</span>
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  {language === 'te' ? "అధికారిక NPCI & RBI అవగాహన వీడియోలు" : "Official NPCI & RBI educational video guides"}
                </p>
              </div>
            </Link>

            {/* 6. Call 1930 */}
            <a
              href="tel:1930"
              className="p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl border-2 border-red-500 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-start gap-4 group"
              aria-label="Direct call to Helpline 1930"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white flex items-center justify-between">
                  <span>{language === 'te' ? "1930 కి కాల్ చేయండి" : "Call 1930 Helpline"}</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-red-100 font-semibold leading-relaxed">
                  {language === 'te' ? "ఆర్థిక నష్టం జరిగితే వెంటనే సంప్రదించండి" : "National Cybercrime Helpline active 24x7"}
                </p>
              </div>
            </a>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
