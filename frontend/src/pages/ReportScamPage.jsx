import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  MessageSquareWarning, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  PhoneCall,
  BellRing,
  LayoutDashboard,
  Volume2,
  VolumeX,
  Bot
} from 'lucide-react';

export const ReportScamPage = () => {
  const { t, language } = useLanguage();
  const { speakText, isSpeaking, stopSpeech } = useAccessibility();
  const navigate = useNavigate();

  const scamTypesEn = [
    "Fake Call / Bank Officer Impersonation",
    "Fake Electricity Bill Disconnection SMS",
    "QR Code Money Deduction Scam",
    "Remote Desktop App Installation Demand (AnyDesk/TeamViewer)",
    "Kaun Banega Crorepati / Lottery Lucky Draw Scam",
    "Work-from-Home / Video Liking Task Scam",
    "Digital Arrest / Fake Police Video Call Fraud"
  ];

  const scamTypesTe = [
    "నకిలీ కాల్ / బ్యాంక్ మేనేజర్ అని చెప్పుకుని మోసం",
    "కరెంట్ బిల్లు చెల్లించలేదని విద్యుత్ నిలిపివేత నకిలీ SMS",
    "క్యూఆర్ కోడ్ స్కాన్ చేసి డబ్బులు కట్ చేసుకునే మోసం",
    "AnyDesk / TeamViewer రిమోట్ యాప్ ఇన్‌స్టాల్ చేయమని డిమాండ్",
    "కేబీసీ / లాటరీ లక్కీ డ్రా బహుమతి మోసం",
    "వర్క్ ఫ్రమ్ హోమ్ / యూట్యూబ్ లైకింగ్ టాస్క్ ఇన్వెస్ట్‌మెంట్ మోసం",
    "డిజిటల్ అరెస్ట్ / నకిలీ పోలీస్ వీడియో కాల్ బెదిరింపు"
  ];

  const currentScamTypes = language === 'te' ? scamTypesTe : scamTypesEn;

  const [scamNumber, setScamNumber] = useState('');
  const [scamType, setScamType] = useState(currentScamTypes[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!scamNumber.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleReadInstructions = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      const textToRead = language === 'te'
        ? "మోసపూరిత నంబర్ లేదా యూపీఐ ఐడీని ఇక్కడ నమోదు చేయండి. మోసం రకాన్ని ఎంచుకుని, జరిగిన వివరాలను క్లుప్తంగా రాసి సమర్పించండి."
        : "Report suspicious cyber scam numbers, UPI IDs, or fraud websites here to alert your fellow citizens.";
      speakText(textToRead);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>{t.toolPages?.backToHome || (language === 'te' ? 'ముఖ్య పేజీకి వెళ్ళు' : 'Back to Home')}</span>
        </button>

        <div className="p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-8">
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
                <MessageSquareWarning className="w-9 h-9" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-[11px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'ప్రజా రక్షణ వేదిక' : 'Community Shield Protection'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {language === 'te' ? 'మోసపూరిత నంబర్ లేదా యూపీఐ ఫిర్యాదు' : 'Report Cyber Scam Number / Fraud'}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  {language === 'te'
                    ? 'మీకు వచ్చిన అనుమానాస్పద ఫోన్ నంబర్లు, యూపీఐ ఐడీలు లేదా నకిలీ లింకులను నమోదు చేసి ఇతరులను కాపాడండి.'
                    : 'Submit suspicious phone numbers, links, or bank handles to alert your community.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleReadInstructions}
              className={`shrink-0 p-2.5 rounded-xl border flex items-center gap-1.5 font-bold text-xs transition-all ${
                isSpeaking
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-xs'
              }`}
              title={language === 'te' ? "సూచనలు వినండి" : "Listen to instructions"}
              aria-label={language === 'te' ? "సూచనలు వినండి" : "Listen to instructions"}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-primary" />}
              <span className="hidden sm:inline font-black">{isSpeaking ? (language === 'te' ? 'ఆపండి' : 'Stop') : (language === 'te' ? 'వినండి' : 'Listen')}</span>
            </button>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-3xl text-center space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                  {language === 'te' ? 'ఫిర్యాదు విజయవంతంగా నమోదైంది!' : 'Scam Report Successfully Submitted!'}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 max-w-md mx-auto mt-2">
                  {language === 'te' 
                    ? 'ధన్యవాదాలు! మీ ఫిర్యాదు మా కమ్యూనిటీ డేటాబేస్‌కు చేర్చబడింది. ఇతర పౌరులు ఈ నంబర్ ద్వారా మోసపోకుండా హెచ్చరిక చేయబడుతుంది.' 
                    : 'Thank you! Your report has been added to our community verification database to protect other citizens.'}
                </p>
              </div>

              {/* Connected Next Actions */}
              <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800/80 space-y-3 text-left">
                <span className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider block text-center">
                  {language === 'te' ? "తదుపరి సిఫార్సు చేయబడిన రక్షణ చర్యలు:" : "Recommended Next Safety Steps:"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href="tel:1930"
                    className="p-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{language === 'te' ? "1930 కి కాల్ చేయి" : "Call 1930 Helpline"}</span>
                  </a>

                  <button
                    onClick={() => navigate('/alerts')}
                    className="p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center gap-2"
                  >
                    <BellRing className="w-4 h-4 text-amber-500" />
                    <span>{language === 'te' ? "లైవ్ హెచ్చరికలు చూడు" : "Live Regional Alerts"}</span>
                  </button>

                  <button
                    onClick={() => navigate('/ai-assistant')}
                    className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{language === 'te' ? "AI అసిస్టెంట్ అడగండి" : "Ask AI Assistant"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setScamNumber('');
                    setDetails('');
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md"
                >
                  {language === 'te' ? 'మరొక ఫిర్యాదు చేయండి' : 'Submit Another Report'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {language === 'te' 
                    ? 'అనుమానాస్పద ఫోన్ నంబర్ / యూపీఐ ఐడీ / వెబ్‌సైట్ లింక్:' 
                    : 'Suspicious Phone Number / UPI ID / Website Link:'}
                </label>
                <input
                  type="text"
                  required
                  value={scamNumber}
                  onChange={(e) => setScamNumber(e.target.value)}
                  placeholder={language === 'te' ? 'ఉదా: +91 9876543210 లేదా fake_merchant@upi' : 'e.g. +91 9876543210 or scammer_handle@upi'}
                  className="w-full p-4 text-sm sm:text-base font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {language === 'te' ? 'మోసం రకం:' : 'Scam Type:'}
                </label>
                <select
                  value={scamType}
                  onChange={(e) => setScamType(e.target.value)}
                  className="w-full p-4 text-sm font-bold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {currentScamTypes.map((st, i) => (
                    <option key={i} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {language === 'te' ? 'సంఘటన సంక్షిప్త వివరాలు:' : 'Brief Incident Description:'}
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    language === 'te' 
                      ? 'మోసగాడు ఏమి డిమాండ్ చేశాడు లేదా ఎలా బెదిరించాడో క్లుప్తంగా రాయండి...' 
                      : 'Provide any details about what the fraudster demanded or said...'
                  }
                  className="w-full p-4 text-sm font-medium rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>
                  {isSubmitting 
                    ? (language === 'te' ? 'సమర్పిస్తోంది...' : 'Submitting...') 
                    : (language === 'te' ? 'కమ్యూనిటీ డేటాబేస్‌కు ఫిర్యాదు సమర్పించండి' : 'Submit Scam Report to Community')}
                </span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportScamPage;
