import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  ArrowLeft, 
  Sparkles,
  Video,
  Play,
  ExternalLink,
  AlertCircle,
  Info,
  Clock,
  RefreshCw
} from 'lucide-react';

export const SecurityProtocolsPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const sec = t.securityProtocols || {};
  const toolPages = t.toolPages || {};

  const [activeVideoId, setActiveVideoId] = useState(null);
  const [failedVideos, setFailedVideos] = useState({});

  const iconsMap = [ShieldCheck, Lock, KeyRound, CheckCircle2, QrCode, Building2];
  const colorsMap = ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-red-600", "bg-indigo-600", "bg-amber-600"];
  const bgMap = [
    "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
    "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800",
    "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800",
    "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800",
    "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800"
  ];

  const protocolsList = (sec.items || []).map((proto, i) => ({
    ...proto,
    icon: iconsMap[i % iconsMap.length],
    color: colorsMap[i % colorsMap.length],
    bg: bgMap[i % bgMap.length]
  }));

  const fallbackVideos = [
    {
      id: "69Enp_kyaUU",
      title: "NPCI UPI Safety: Never Enter UPI PIN to Receive Money",
      desc: "Official NPCI campaign video explaining that entering a UPI PIN always debits funds from your account, never credits it.",
      duration: "1:00 Min",
      category: "UPI PIN Security",
      channel: "NPCI UPI Chalega"
    },
    {
      id: "3VzBUH5eY_Q",
      title: "NPCI: Verify Merchant Name Before Scanning QR & Paying",
      desc: "Learn how to detect fraudulent merchant QR overlays and confirm receiver names before authorizing payments.",
      duration: "0:45 Min",
      category: "QR Code Safety",
      channel: "NPCI UPI Chalega"
    },
    {
      id: "P-IdTqWDA3Y",
      title: "UPI Security: Protect Your OTP & Avoid Remote Access Apps",
      desc: "Guidelines on why banks never ask for OTP or remote app screen-sharing access like AnyDesk or TeamViewer.",
      duration: "0:50 Min",
      category: "OTP & Device Safety",
      channel: "NPCI UPI Chalega"
    },
    {
      id: "gMMrrmdq9-I",
      title: "UPI Chalega: Digital Payment Security & Fraud Awareness",
      desc: "Comprehensive public awareness on safe digital UPI transactions and daily cyber hygiene for Indian citizens.",
      duration: "1:30 Mins",
      category: "General Cyber Hygiene",
      channel: "NPCI / RBI Awareness"
    }
  ];

  const videoList = (sec.videos && sec.videos.length > 0) ? sec.videos : fallbackVideos;

  const markVideoFailed = (id) => {
    setFailedVideos(prev => ({ ...prev, [id]: true }));
  };

  const retryVideo = (id) => {
    setFailedVideos(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveVideoId(id);
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>{toolPages.backToHome || 'Back to Home'}</span>
          </button>

          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {sec.badge || 'NPCI & RBI Cyber Safety Standards'}
          </span>
        </div>

        {/* Hero Banner */}
        <div className="p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white rounded-[28px] shadow-2xl space-y-4 border border-slate-800">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{sec.heroBadge || 'National Cyber Hygiene Directives'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {sec.title || 'Official Security Protocols & Safety Standards'}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-bold max-w-3xl leading-relaxed">
            {sec.subtitle || 'Essential cybersecurity rules issued under Indian Cybercrime Coordination Centre (I4C), NPCI, and RBI directives to protect digital payment users against financial fraud.'}
          </p>
        </div>

        {/* Protocols Grid */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>{sec.title || 'Standard Security Directives'}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {protocolsList.map((proto, idx) => {
              const IconComp = proto.icon;
              return (
                <div
                  key={proto.id || idx}
                  className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${proto.color} text-white flex items-center justify-center shadow-lg shrink-0`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {proto.title}
                      </h3>
                    </div>

                    <div className={`p-4 rounded-2xl border ${proto.bg} space-y-2`}>
                      {(proto.rules || []).map((rule, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug">
                          <span className="text-emerald-600 font-black">•</span>
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                    <span>{sec.verifiedGuideline || 'Verified Guideline'}</span>
                    <span>{sec.rulePrefix || 'Rule #'} {proto.id || idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Protocols Section */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider">
                <Video className="w-3.5 h-3.5" />
                <span>NPCI & RBI Video Directives</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {sec.videoSectionTitle || 'Official Cyber Safety Video Protocols'}
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                {sec.videoSectionSubtitle || 'Watch verified official NPCI and cyber safety campaign videos on UPI PIN protection, merchant QR verification, and digital payment security.'}
              </p>
            </div>
          </div>

          {/* Browser / Firewall Advisory Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
              {sec.videoNotice || "If this video player is blocked by your browser extensions or network firewall, click 'Watch Video on YouTube' to view it directly on the official channel."}
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {videoList.map((vid, idx) => {
              const isPlaying = activeVideoId === vid.id;
              const isFailed = !!failedVideos[vid.id];
              const watchUrl = `https://www.youtube.com/watch?v=${vid.id}`;
              const thumbUrl = `https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`;

              return (
                <div
                  key={vid.id || idx}
                  className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Video Media Container (16:9 Aspect Ratio) */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    {isFailed ? (
                      /* Error Fallback with Direct YouTube Link */
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white space-y-3">
                        <AlertCircle className="w-10 h-10 text-amber-400" />
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white">
                            {language === 'te' ? 'వీడియో ప్లేయర్ లోడ్ కాలేదు' : 'Video Player Blocked or Unavailable'}
                          </h4>
                          <p className="text-xs text-slate-300 max-w-sm">
                            {language === 'te'
                              ? 'బ్రౌజర్ ప్రైవసీ సెట్టింగ్‌లు లేదా కంటెంట్ బ్లాకర్ వల్ల వీడియో ప్లేబ్యాక్ నిరోధించబడింది.'
                              : 'Embedded playback may be blocked by your browser privacy settings or content filters.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow transition-colors"
                          >
                            <span>{sec.watchOnYoutube || 'Watch Video on YouTube'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => retryVideo(vid.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{language === 'te' ? 'మళ్ళీ ప్రయత్నించు' : 'Retry'}</span>
                          </button>
                        </div>
                      </div>
                    ) : isPlaying ? (
                      /* Active YouTube Iframe Embed */
                      <div className="w-full h-full relative">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${vid.id}?autoplay=1&rel=0&modestbranding=1`}
                          title={vid.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          onError={() => markVideoFailed(vid.id)}
                        />
                        <button
                          onClick={() => setActiveVideoId(null)}
                          className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[10px] font-black tracking-wider uppercase transition-colors z-10 shadow"
                          title="Close Video"
                        >
                          ✕ {language === 'te' ? 'మూసివేయి' : 'Close'}
                        </button>
                      </div>
                    ) : (
                      /* Thumbnail Preview with Play Overlay */
                      <div
                        onClick={() => setActiveVideoId(vid.id)}
                        className="w-full h-full relative cursor-pointer group"
                      >
                        <img
                          src={thumbUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://img.youtube.com/vi/${vid.id}/0.jpg`;
                          }}
                        />
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 group-hover:from-black/75 transition-colors" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-red-600/95 text-white text-[11px] font-black uppercase tracking-wider shadow">
                            {vid.category || 'UPI Safety'}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>{vid.duration}</span>
                          </span>
                        </div>

                        {/* Big Center Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                            <Play className="w-7 h-7 fill-white translate-x-0.5" />
                          </div>
                        </div>

                        {/* Bottom Tag Bar */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold drop-shadow">
                          <span>{vid.channel || 'NPCI Official'}</span>
                          <span className="text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{sec.verifiedGuideline || 'Verified'}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content & Action Bar */}
                  <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors">
                        {vid.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {vid.desc}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            setActiveVideoId(null);
                          } else {
                            setActiveVideoId(vid.id);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-all ${
                          isPlaying 
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300' 
                            : 'bg-primary hover:bg-primary-light text-white'
                        }`}
                      >
                        {isPlaying ? (
                          <span>{language === 'te' ? 'ప్లేయర్ ఆపు' : 'Stop Player'}</span>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{language === 'te' ? 'ఇక్కడే చూడండి' : 'Play Video'}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 text-xs font-extrabold border border-slate-200 dark:border-slate-600 transition-all"
                        title="Watch on official YouTube channel"
                      >
                        <span>{sec.watchOnYoutube || 'Watch Video on YouTube'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default SecurityProtocolsPage;
