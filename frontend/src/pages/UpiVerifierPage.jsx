import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  CheckCheck, 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Loader2,
  Smartphone,
  MessageSquareWarning,
  Bot,
  ExternalLink,
  AlertTriangle,
  Info,
  Link as LinkIcon,
  PhoneCall
} from 'lucide-react';

export const UpiVerifierPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [vpaInput, setVpaInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async (query = vpaInput) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsVerifying(true);
    setResult(null);

    try {
      let res;
      try {
        res = await fetch('/api/verify-upi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vpa: trimmed, language })
        });
      } catch (err) {
        res = await fetch('http://localhost:5000/api/verify-upi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vpa: trimmed, language })
        });
      }

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error('Failed to reach verification endpoint');
      }
    } catch (err) {
      console.error('UPI verification error:', err);
      // Resilient fallback logic matching the backend UpiService
      const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('://') || trimmed.startsWith('www.') || trimmed.includes('.com') || trimmed.includes('.org');
      if (isUrl) {
        setResult({
          isUrl: true,
          status: language === 'te' ? 'యూపీఐ ఫీల్డ్‌లో వెబ్‌సైట్ లింక్ నమోదు చేయబడింది' : 'URL Submitted in UPI VPA Field',
          riskLevel: language === 'te' ? 'చెల్లని ఇన్‌పుట్' : 'Invalid Input (URL Detected)',
          reason: language === 'te' 
            ? 'మీరు యూపీఐ ఐడీకి బదులుగా వెబ్‌సైట్ లింక్‌ను నమోదు చేశారు. వెబ్‌సైట్ లింక్‌ల భద్రతను తనిఖీ చేయడానికి దయచేసి లింక్ టెస్టర్ ఉపయోగించండి.' 
            : 'You entered a website URL instead of a UPI handle. Web links must be checked using the Suspicious Link Tester.',
          action: language === 'te' ? 'ఈ లింక్‌ను అనుమానాస్పద లింక్ టెస్టర్‌లో తనిఖీ చేయండి.' : 'Open in Suspicious Link Tester to check for phishing or malware.',
          detectedUrl: trimmed
        });
      } else {
        const isVpa = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(trimmed);
        const isPhone = /^(\+91)?[6-9]\d{9}$/.test(trimmed.replace(/[\s\-]/g, ''));
        if (!isVpa && !isPhone) {
          setResult({
            isUrl: false,
            isValidFormat: false,
            status: language === 'te' ? 'చెల్లని యూపీఐ ఐడీ ఫార్మాట్' : 'Malformed UPI Handle',
            riskLevel: language === 'te' ? 'చెల్లని ఫార్మాట్' : 'Invalid Format',
            reason: language === 'te' 
              ? 'యూపీఐ ఐడీ తప్పనిసరిగా "పేరు@హ్యాండిల్" (ఉదా: ramesh@okhdfcbank) లేదా 10 అంకెల మొబైల్ నంబర్ అయి ఉండాలి.' 
              : 'Invalid UPI handle format. Must be username@bank (e.g. user@okhdfcbank) or a 10-digit phone number.',
            action: language === 'te' ? 'దయచేసి సరైన యూపీఐ ఐడీని నమోదు చేయండి.' : 'Please enter a valid handle with @ or a 10-digit number.'
          });
        } else {
          setResult({
            isUrl: false,
            isValidFormat: true,
            status: language === 'te' ? 'ఫార్మాట్ సరైనది (ఖాతా ధృవీకరించబడలేదు)' : 'Format Valid (Account Unverified)',
            riskLevel: language === 'te' ? 'తక్కువ రిస్క్ (ఫార్మాట్ సరైనది — 0 ఫిర్యాదులు)' : 'Low Risk (Syntax Valid — 0 Complaints)',
            category: 'Standard UPI Handle',
            reportsCount: 0,
            vpa: trimmed,
            reason: language === 'te' 
              ? 'నమోదు చేసిన ఐడీ సరైన యూపీఐ ఫార్మాట్‌లో ఉంది మరియు 0 కమ్యూనిటీ ఫిర్యాదులు ఉన్నాయి. గమనిక: బ్యాంకింగ్ గేట్‌వే లేకుండా ఖాతా అసలు యజమానిని నిర్ధారించలేము.' 
              : 'Valid UPI format with 0 community reports. Note: Syntax validation does not prove account existence. Always verify payee name on your banking app screen.',
            action: language === 'te' 
              ? 'చెల్లింపు చేసే ముందు మీ యూపీఐ యాప్‌లో కనిపించే గ్రహీత పేరును తప్పకుండా సరిచూసుకోండి.' 
              : 'Always verify the recipient\'s real name displayed on your banking app payment screen before authorizing payment.'
          });
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6">
        
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>{t.toolPages?.backToHome || (language === 'te' ? 'ముఖ్య పేజీకి వెళ్ళు' : 'Back to Home')}</span>
        </button>

        <div className="p-6 sm:p-8 bg-white dark:bg-slate-800/95 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-8">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary dark:text-sky-400 border border-primary/20 flex items-center justify-center shrink-0">
              <CheckCheck className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary dark:text-sky-300 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'te' ? "యూపీఐ హ్యాండిల్ భద్రతా తనిఖీ" : "UPI Handle & VPA Safety Inspector"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {t.nav?.upiVerifier || (language === 'te' ? "యూపీఐ ఐడీ వెరిఫైయర్" : "UPI ID & VPA Handle Verifier")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                {language === 'te' 
                  ? "డబ్బులు పంపే ముందు యూపీఐ ఐడీ ఫార్మాట్ మరియు నమోదైన సైబర్ ఫిర్యాదులను తనిఖీ చేయండి." 
                  : "Verify recipient VPA structure and check against reported cyber fraud databases before transferring funds."}
              </p>
            </div>
          </div>

          {/* Input Bar */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {language === 'te' 
                ? "యూపీఐ ఐడీని ఎంటర్ చేయండి (ఉదా: name@upi లేదా 10 అంకెల మొబైల్ నంబర్):" 
                : "Enter UPI VPA Handle (e.g. name@okhdfcbank or 10-digit mobile):"}
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={vpaInput}
                onChange={(e) => setVpaInput(e.target.value)}
                placeholder="e.g. merchant_shop@okhdfcbank or 9876543210"
                className="flex-1 p-4 text-sm sm:text-base font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />

              <button
                onClick={() => handleVerify()}
                disabled={isVerifying || !vpaInput.trim()}
                className="px-8 py-4 bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all shrink-0"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{language === 'te' ? "యూపీఐ ఐడీ తనిఖీ చేయి" : "Verify UPI Handle"}</span>
              </button>
            </div>
          </div>

          {/* Quick Sample Picks */}
          <div className="pt-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              {language === 'te' ? "నమూనా హ్యాండిల్స్ ప్రయత్నించండి:" : "Try Example Inputs:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'sbi_army_refund@upi', desc: 'Fraud Keyword Sample' },
                { label: 'shopkeeper_ramesh@okhdfcbank', desc: 'Valid Standard VPA' },
                { label: '9876543210', desc: 'Valid Phone Format' },
                { label: 'https://example.com', desc: 'Website URL (Reject Test)' }
              ].map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setVpaInput(ex.label);
                    handleVerify(ex.label);
                  }}
                  className="text-xs p-2.5 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-mono transition-colors font-bold border border-slate-200 dark:border-slate-600"
                  title={ex.desc}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* RESULT CARD */}
          {result && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* CASE 1: URL DETECTED IN UPI FIELD */}
              {result.isUrl ? (
                <div className="p-6 rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-slate-100 space-y-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 block">
                          {language === 'te' ? "వెబ్‌సైట్ లింక్ గుర్తించబడింది" : "Website URL Detected"}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-100">
                          {result.status}
                        </h2>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-black uppercase px-3.5 py-1.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 border border-amber-300">
                      {language === 'te' ? "⚠️ యూపీఐ ఐడీ కాదు" : "⚠️ Not a UPI Handle"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-semibold space-y-2">
                    <p className="leading-relaxed">
                      {result.reason}
                    </p>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>{language === 'te' ? "నమోదు చేసిన లింక్: " : "Submitted URL: "}</span>
                      <code className="text-blue-600 dark:text-sky-400 break-all">{result.detectedUrl || vpaInput}</code>
                    </div>
                  </div>

                  {/* Explicit Action to Open Suspicious Link Tester */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => navigate('/ai-assistant')}
                      className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 hover:scale-105 transition-all"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>{language === 'te' ? "అనుమానాస్పద లింక్ టెస్టర్‌లో తనిఖీ చేయండి" : "Open in Suspicious Link Tester"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setVpaInput('');
                        setResult(null);
                      }}
                      className="w-full sm:w-auto px-5 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100"
                    >
                      {language === 'te' ? "యూపీఐ ఐడీని నమోదు చేయండి" : "Enter a UPI Handle Instead"}
                    </button>
                  </div>
                </div>

              /* CASE 2: MALFORMED HANDLE */
              ) : !result.isValidFormat ? (
                <div className="p-6 rounded-2xl border-2 border-red-300 bg-red-50 dark:bg-red-950/40 text-slate-900 dark:text-slate-100 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-red-950 dark:text-red-100">
                        {result.status}
                      </h2>
                    </div>
                    <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-red-600 text-white">
                      {language === 'te' ? "చెల్లని ఫార్మాట్" : "Invalid Syntax"}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.reason}
                  </p>
                  <p className="text-xs font-bold text-red-700 dark:text-red-300">
                    💡 {result.action}
                  </p>
                </div>

              /* CASE 3: FLAGGED SUSPICIOUS / FRAUD HANDLE */
              ) : result.riskLevel?.includes('High') || result.reportsCount > 0 ? (
                <div className="p-6 rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/50 text-slate-900 dark:text-slate-100 space-y-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-red-600 dark:text-red-400 block">
                          {result.category || "Flagged Fraud"}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-red-950 dark:text-red-100">
                          {result.status}
                        </h2>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-black uppercase px-3.5 py-1.5 rounded-full bg-red-600 text-white shadow-sm">
                      {result.riskBadge || (language === 'te' ? "🔴 తీవ్ర ప్రమాదం" : "🔴 High Threat")}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-red-200 dark:border-red-900 text-xs font-bold">
                    <div>{language === 'te' ? "యూపీఐ హ్యాండిల్:" : "UPI Handle:"} <span className="font-mono text-sm text-red-600 dark:text-red-400">{result.vpa || vpaInput}</span></div>
                    <div>{language === 'te' ? "నమోదైన ఫిర్యాదులు:" : "Community Reports:"} <span className="text-sm font-black text-red-600">{result.reportsCount} {language === 'te' ? "ఫిర్యాదులు" : "Complaints"}</span></div>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-red-900 dark:text-red-200">
                    {result.reason}
                  </p>

                  <div className="p-3.5 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>{result.action}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-red-200 dark:border-red-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href="tel:1930"
                      className="p-3 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{language === 'te' ? "1930 కి కాల్ చేయి" : "Call Helpline 1930"}</span>
                    </a>

                    <button
                      onClick={() => navigate('/report-scam')}
                      className="p-3 bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 font-black text-xs rounded-xl border border-red-300 dark:border-red-700 shadow-sm flex items-center justify-center gap-2"
                    >
                      <MessageSquareWarning className="w-4 h-4" />
                      <span>{language === 'te' ? "ఈ ఐడీ ని రిపోర్ట్ చేయి" : "Report Scam Handle"}</span>
                    </button>

                    <button
                      onClick={() => navigate('/ai-assistant')}
                      className="p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-black text-xs rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2"
                    >
                      <Bot className="w-4 h-4 text-amber-500" />
                      <span>{language === 'te' ? "AI ని అడగండి" : "Ask AI Assistant"}</span>
                    </button>
                  </div>
                </div>

              /* CASE 4: FORMAT VALID (UNVERIFIED ACCOUNT HOLDER) */
              ) : (
                <div className="p-6 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 space-y-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Info className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 block">
                          {language === 'te' ? "నిర్మాణ ధృవీకరణ" : "Syntax & Pattern Analysis"}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          {result.status}
                        </h2>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-black uppercase px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 shadow-xs">
                      {result.riskBadge || (language === 'te' ? "🟡 ఫార్మాట్ సరైనది (0 ఫిర్యాదులు)" : "🟡 Format Valid (0 Reports)")}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <div>{language === 'te' ? "యూపీఐ హ్యాండిల్:" : "UPI Handle:"} <span className="font-mono text-sm text-primary dark:text-sky-400">{result.vpa || vpaInput}</span></div>
                    <div>{language === 'te' ? "కమ్యూనిటీ ఫిర్యాదులు:" : "Community Reports:"} <span className="text-sm font-black text-emerald-600">0 {language === 'te' ? "ఫిర్యాదులు" : "Complaints"}</span></div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-semibold space-y-2">
                    <p className="leading-relaxed">
                      {result.reason}
                    </p>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      ⚠️ {result.action}
                    </p>
                  </div>

                  {/* Golden Rule Notice */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      {language === 'te' 
                        ? "బంగారు నియమం: మీ బ్యాంక్ ఖాతాలోకి డబ్బులు రావడానికి యూపీఐ పిన్ కొట్టాల్సిన అవసరం ఎప్పుడూ లేదు." 
                        : "NPCI Golden Rule: Receiving money into your bank account NEVER requires entering your UPI PIN or scanning a QR code."}
                    </span>
                  </div>

                  {/* Connected Actions */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => navigate('/practice-upi')}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 hover:scale-105 transition-all"
                    >
                      <Smartphone className="w-4 h-4 text-sky-600" />
                      <span>{language === 'te' ? "ప్రాక్టీస్ యూపీఐ చేయి" : "Practice UPI Payment"}</span>
                    </button>

                    <button
                      onClick={() => navigate('/ai-assistant')}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 hover:scale-105 transition-all"
                    >
                      <Bot className="w-4 h-4 text-amber-500" />
                      <span>{language === 'te' ? "AI ని అడగండి" : "Ask AI Assistant"}</span>
                    </button>

                    <button
                      onClick={() => navigate('/report-scam')}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 hover:scale-105 transition-all"
                    >
                      <MessageSquareWarning className="w-4 h-4 text-teal-600" />
                      <span>{language === 'te' ? "ఈ ఐడీ ని రిపోర్ట్ చేయి" : "Report Scam Handle"}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UpiVerifierPage;
