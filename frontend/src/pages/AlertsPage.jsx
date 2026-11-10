import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  BellRing, 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldAlert,
  Volume2,
  VolumeX,
  PhoneCall,
  Bot,
  MessageSquareWarning
} from 'lucide-react';

export const AlertsPage = () => {
  const { t, language } = useLanguage();
  const { speakText, isSpeaking, stopSpeech } = useAccessibility();
  const navigate = useNavigate();
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const alertItemsEn = [
    {
      id: 1,
      title: "Fake Electricity Bill Disconnection SMS Scam",
      region: "Telangana & Andhra Pradesh",
      time: "10 Minutes Ago",
      level: "CRITICAL ALERT",
      desc: "SMS claiming: 'Your power supply will be disconnected tonight at 9:30 PM due to unpaid bill. Call 98765xxxxx immediately.' DO NOT CALL OR CLICK LINKS. Real power departments never send such personal mobile threats."
    },
    {
      id: 2,
      title: "WhatsApp Army Officer Car / Bike Sale Scam",
      region: "Rural & Suburban Districts",
      time: "2 Hours Ago",
      level: "HIGH ALERT",
      desc: "Fraudsters posing as transferred Army personnel selling bikes or cars at unrealistically low prices. They demand advance UPI payments for military gate pass or transport. Never pay advance money."
    },
    {
      id: 3,
      title: "KBC ₹25 Lakh WhatsApp Voice Note Fraud",
      region: "Pan-India Rural Districts",
      time: "5 Hours Ago",
      level: "MODERATE ALERT",
      desc: "Fake audio voice notes claiming your mobile won Kaun Banega Crorepati lucky draw and demanding ₹12,500 registration tax. Government and TV shows never award cash via WhatsApp voice notes."
    },
    {
      id: 4,
      title: "Fake Bank KYC Update & Account Suspension Call",
      region: "National Broadcast",
      time: "1 Day Ago",
      level: "HIGH ALERT",
      desc: "Robocalls pretending to be SBI, HDFC, or Andhra Bank managers claiming your savings account is suspended due to expired PAN card. They ask for your 6-digit OTP. Banks never ask for OTPs."
    }
  ];

  const alertItemsTe = [
    {
      id: 1,
      title: "కరెంట్ బిల్లు చెల్లించలేదని విద్యుత్ నిలిపివేత నకిలీ SMS మోసం",
      region: "తెలంగాణ & ఆంధ్రప్రదేశ్",
      time: "10 నిమిషాల క్రితం",
      level: "అత్యవసర హెచ్చరిక",
      desc: "SMS సందేశం: 'మీ విద్యుత్ బిల్లు పెండింగ్‌లో ఉంది. ఈ రాత్రి 9:30 గంటలకు విద్యుత్ సరఫరా ఆగిపోతుంది. వెంటనే 98765xxxxx కి కాల్ చేయండి.' ఎలాంటి లింకులు నొక్కవద్దు లేదా ఆ నంబర్లకు కాల్ చేయవద్దు. విద్యుత్ శాఖ అధికారులు వ్యక్తిగత ఫోన్ నంబర్ల నుండి ఇలాంటి బెదిరింపు సందేశాలు పంపరు."
    },
    {
      id: 2,
      title: "వాట్సాప్ ఆర్మీ ఆఫీసర్ బైక్ / కార్ అమ్మకం పేరుతో మోసం",
      region: "గ్రామీణ మరియు పట్టణ జిల్లాలు",
      time: "2 గంటల క్రితం",
      level: "ప్రమాదకర హెచ్చరిక",
      desc: "బదిలీపై వెళ్తున్న సైనిక అధికారి పేరిట చాలా తక్కువ ధరకే బైక్ లేదా కార్ అమ్ముతామని నకిలీ ఫొటోలు పెట్టి మోసం చేస్తున్నారు. మిలిటరీ గేట్ పాస్ లేదా డెలివరీ ఛార్జీల పేరుతో ముందుగా యూపీఐ ద్వారా డబ్బులు అడుగుతారు. ఎట్టి పరిస్థితుల్లోనూ ముందస్తు నగదు చెల్లించవద్దు."
    },
    {
      id: 3,
      title: "KBC ₹25 లక్షల లక్కీ డ్రా నకిలీ వాయిస్ నోట్ మోసం",
      region: "గ్రామీణ ప్రాంతాలు",
      time: "5 గంటల క్రితం",
      level: "మధ్యస్థ హెచ్చరిక",
      desc: "మీ మొబైల్ నంబర్ కేబీసీ లక్కీ డ్రాలో ₹25 లక్షలు గెలుచుకుందని వాట్సాప్‌లో నకిలీ ఆడియో మెసేజ్‌లు పంపుతున్నారు. ఆ బహుమతి డబ్బును పొందడానికి రిజిస్ట్రేషన్ ఫీజు లేదా జీఎస్టీ రూపంలో ₹12,500 చెల్లించమంటున్నారు. ఇలాంటి సందేశాలను వెంటనే బ్లాక్ చేయండి."
    },
    {
      id: 4,
      title: "బ్యాంక్ కేవైసీ గడువు ముగిసిందని ఖాతా రద్దు బెదిరింపు కాల్స్",
      region: "దేశవ్యాప్త హెచ్చరిక",
      time: "1 రోజు క్రితం",
      level: "ప్రమాదకర హెచ్చరిక",
      desc: "బ్యాంక్ మేనేజర్‌గా చెప్పుకుంటూ కాల్ చేసి పాన్ కార్డ్ అప్‌డేట్ చేయకపోతే బ్యాంక్ ఖాతా బ్లాక్ అవుతుందని బెదిరిస్తున్నారు. మీ ఫోన్‌కు వచ్చే 6 అంకెల ఓటీపీని అడుగుతున్నారు. బ్యాంకులు ఎప్పుడూ ఫోన్‌లో రహస్య ఓటీపీని అడగవు."
    }
  ];

  const alertItems = language === 'te' ? alertItemsTe : alertItemsEn;

  const handleToggleSpeak = (alert) => {
    if (isSpeaking && activeSpeakingId === alert.id) {
      stopSpeech();
      setActiveSpeakingId(null);
    } else {
      stopSpeech();
      setActiveSpeakingId(alert.id);
      speakText(`${alert.title}. ${language === 'te' ? 'ప్రాంతం:' : 'Region:'} ${alert.region}. ${alert.desc}`);
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
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
              <BellRing className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'ప్రత్యక్ష పౌర సైబర్ రక్షణ' : 'Real-Time Citizen Protection'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {language === 'te' ? 'లైవ్ ప్రాంతీయ సైబర్ మోసాల హెచ్చరికలు' : 'Live Regional Fraud Alerts'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                {language === 'te' 
                  ? 'ప్రస్తుతం మీ ప్రాంతంలో నమోదవుతున్న తాజా సైబర్ మోసాల వివరాలు మరియు వాటి నుండి రక్షణ మార్గాలు.' 
                  : 'Real-time alerts broadcasted for cyber scams currently reported in your local area.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {alertItems.map((alert) => {
              const isCurrentSpeaking = isSpeaking && activeSpeakingId === alert.id;
              return (
                <div 
                  key={alert.id} 
                  className={`p-6 rounded-2xl border transition-all space-y-4 shadow-sm ${
                    alert.level.includes('CRITICAL') || alert.level.includes('అత్యవసర')
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80'
                      : 'bg-amber-50/50 dark:bg-slate-900/60 border-amber-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${
                      alert.level.includes('CRITICAL') || alert.level.includes('అత్యవసర')
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {alert.level}
                    </span>
                    
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {alert.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-secondary" /> {alert.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                      {alert.title}
                    </h2>
                    <button
                      onClick={() => handleToggleSpeak(alert)}
                      className={`shrink-0 p-2.5 rounded-xl border flex items-center gap-1.5 font-bold text-xs transition-all ${
                        isCurrentSpeaking
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-xs'
                      }`}
                      title={language === 'te' ? "హెచ్చరికను బిగ్గరగా వినండి" : "Listen to alert aloud"}
                      aria-label={language === 'te' ? "హెచ్చరికను బిగ్గరగా వినండి" : "Listen to alert aloud"}
                    >
                      {isCurrentSpeaking ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-primary" />}
                      <span className="hidden sm:inline font-black">{isCurrentSpeaking ? (language === 'te' ? 'ఆపండి' : 'Stop') : (language === 'te' ? 'వినండి' : 'Listen')}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
                    {alert.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Safety Actions Hub */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider block">
              {language === 'te' ? "సంబంధిత భద్రతా చర్యలు:" : "Related Cyber Safety Actions:"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/report-scam')}
                className="p-3.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquareWarning className="w-4 h-4 text-amber-400" />
                <span>{language === 'te' ? "మోసపూరిత నంబర్ ఫిర్యాదు" : "Report Fraud Number"}</span>
              </button>

              <button
                onClick={() => navigate('/ai-assistant')}
                className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>{language === 'te' ? "AI అసిస్టెంట్‌ని అడగండి" : "Ask AI Assistant"}</span>
              </button>

              <a
                href="tel:1930"
                className="p-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{language === 'te' ? "హెల్ప్‌లైన్ 1930 కి కాల్ చేయి" : "Call 1930 Helpline"}</span>
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlertsPage;
