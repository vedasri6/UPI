import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  QrCode, 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Loader2,
  Smartphone,
  MessageSquareWarning,
  PhoneCall,
  LayoutDashboard
} from 'lucide-react';

export const QrScannerPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const simulateScan = (type) => {
    setIsScanning(type);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(null);
      if (type === 'safe') {
        setScanResult({
          status: language === 'te' ? 'ధృవీకరించబడిన సురక్షిత వ్యాపార క్యూఆర్' : 'SAFE VERIFIED MERCHANT QR',
          merchantName: 'Ramesh Kirana General Store',
          vpa: 'ramesh.kirana@okaxis',
          isSafe: true,
          riskBadge: language === 'te' ? '🟢 సురక్షితం' : '🟢 Safe',
          actionType: 'DEBIT (PAYING MERCHANT)',
          message: language === 'te' ? 'అధికారిక NPCI వ్యాపారి క్యూఆర్ కోడ్. బిల్లు చెల్లించడానికి సురక్షితం.' : 'Official verified NPCI merchant QR code. Safe for transferring bill amount.'
        });
      } else {
        setScanResult({
          status: language === 'te' ? 'హెచ్చరిక: నకిలీ క్యాష్‌బ్యాక్ క్యూఆర్ స్కామ్' : 'WARNING: FAKE CASHBACK QR SCAM',
          merchantName: 'Unverified Online Cashback Portal',
          vpa: 'collect_cashback_99@upi',
          isSafe: false,
          riskBadge: language === 'te' ? '🔴 అత్యంత ప్రమాదకరం' : '🔴 High Risk',
          actionType: 'DEBIT (MONEY WILL BE DEDUCTED)',
          message: language === 'te' ? 'యూపీఐ పిన్ కొట్టవద్దు! ఈ క్యూఆర్ స్కాన్ చేస్తే మీ ఖాతా నుండి డబ్బులు కట్ అవుతాయి.' : 'DO NOT ENTER YOUR PIN! Scanning this QR code and entering PIN will DEDUCT money from your account.'
        });
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-6">
        
        {/* Back Navigation Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-extrabold text-xs shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.toolPages?.backToHome || 'Back to Home'}</span>
        </button>

        {/* Page Container */}
        <div className="p-8 bg-white dark:bg-slate-800/95 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-8">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <QrCode className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'te' ? "AI చెల్లింపుల ప్రమాద గుర్తింపు సాధనం" : "AI Payment Intention Detector"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {t.nav?.qrScanner || "Safe QR Code Scanner"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                {language === 'te' ? "చెల్లింపు చేసే ముందు క్యూఆర్ కోడ్‌ను స్కాన్ చేసి గ్రహీత అసలు వివరాలు తెలుసుకోండి." : "Detects whether a QR code is an outgoing payment debit request or an unverified cashback scam."}
              </p>
            </div>
          </div>

          {/* Interactive QR Simulation Viewport */}
          <div className="flex flex-col items-center justify-center p-8 bg-slate-950 text-white rounded-3xl space-y-6 relative overflow-hidden border border-slate-800">
            
            <div className="relative w-48 h-48 border-4 border-emerald-400 rounded-2xl flex items-center justify-center bg-slate-900 shadow-2xl">
              <QrCode className="w-28 h-28 text-slate-400 opacity-60" />

              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-xs rounded-xl flex items-center justify-center animate-pulse">
                  <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce" />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 font-bold text-center max-w-sm">
              {language === 'te' ? "ముఖ్య నియమం: డబ్బులు అందుకోవడానికి ఎప్పుడూ క్యూఆర్ స్కాన్ చేయవద్దు!" : "Golden Rule: Receiving money NEVER requires scanning a QR code or entering a UPI PIN!"}
            </p>

            {/* Test Simulation Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                onClick={() => simulateScan('safe')}
                disabled={!!isScanning}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {isScanning === 'safe' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{language === 'te' ? "షాప్ క్యూఆర్ స్కాన్ చేయి" : "Scan Verified Shop QR"}</span>
              </button>

              <button
                onClick={() => simulateScan('scam')}
                disabled={!!isScanning}
                className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {isScanning === 'scam' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                <span>{language === 'te' ? "ఫేక్ క్యాష్‌బ్యాక్ క్యూఆర్ స్కాన్ చేయి" : "Scan Fake Cashback QR"}</span>
              </button>
            </div>
          </div>

          {/* Results Box & Connected Journey */}
          {scanResult && (
            <div className={`p-6 rounded-2xl border ${
              scanResult.isSafe 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                : 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
            } space-y-6 animate-in fade-in`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg flex items-center gap-2">
                  {scanResult.isSafe ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : <ShieldAlert className="w-6 h-6 text-red-600" />}
                  {scanResult.status}
                </span>
                <span className="text-xs font-black uppercase px-3.5 py-1 rounded-full bg-white/80 dark:bg-black/50 border border-current/20 shadow-sm">
                  {scanResult.riskBadge}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-xs font-bold pt-1">
                <div>Recipient: <span className="font-normal">{scanResult.merchantName}</span></div>
                <div>UPI VPA Handle: <span className="font-mono">{scanResult.vpa}</span></div>
              </div>

              <p className="text-xs sm:text-sm font-semibold pt-3 border-t border-current/20 leading-relaxed">
                {scanResult.message}
              </p>

              {/* Connected Next Actions */}
              <div className="pt-4 border-t border-current/20 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider block">
                  {language === 'te' ? "తదుపరి సిఫార్సు చేయబడిన చర్యలు:" : "Recommended Next Actions:"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => navigate('/practice-upi')}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>{language === 'te' ? "ప్రాక్టీస్ యూపీఐ చేయి" : "Try Practice UPI"}</span>
                  </button>

                  <button
                    onClick={() => navigate('/report-scam')}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <MessageSquareWarning className="w-4 h-4 text-teal-600" />
                    <span>{language === 'te' ? "నకిలీ క్యూఆర్ రిపోర్ట్ చేయి" : "Report Fake QR"}</span>
                  </button>

                  <a
                    href="tel:1930"
                    className="p-3.5 rounded-xl bg-red-600 text-white font-black text-xs shadow-sm flex items-center gap-2 hover:bg-red-700 transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{language === 'te' ? "1930 కి కాల్ చేయి" : "Call 1930 Helpline"}</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QrScannerPage;
