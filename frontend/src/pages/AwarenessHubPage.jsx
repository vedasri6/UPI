import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  GraduationCap, 
  ArrowLeft, 
  Volume2, 
  PlayCircle, 
  FileText, 
  Sparkles, 
  Award,
  Users,
  Building2,
  AlertTriangle,
  ExternalLink,
  Video
} from 'lucide-react';

export const AwarenessHubPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const hub = t.awarenessHub || {};
  const toolPages = t.toolPages || {};

  const citizenGuidesIcons = [Users, Users, Users, GraduationCap];
  const citizenGuidesColors = ["bg-emerald-600", "bg-purple-600", "bg-pink-600", "bg-blue-600"];

  const citizenGuidesList = (hub.citizenGuides || []).map((item, idx) => ({
    ...item,
    icon: citizenGuidesIcons[idx % citizenGuidesIcons.length],
    color: citizenGuidesColors[idx % citizenGuidesColors.length]
  }));

  const govPostersIcons = [FileText, Building2, AlertTriangle];
  const govPostersColors = [
    "text-blue-600 bg-blue-50 border-blue-200",
    "text-amber-600 bg-amber-50 border-amber-200",
    "text-red-600 bg-red-50 border-red-200"
  ];

  const govPostersList = (hub.govPosters || []).map((item, idx) => ({
    ...item,
    icon: govPostersIcons[idx % govPostersIcons.length],
    color: govPostersColors[idx % govPostersColors.length]
  }));

  const videoGuidesColors = ["bg-indigo-600", "bg-emerald-600", "bg-rose-600"];

  const videoGuidesList = (hub.videoGuides || []).map((item, idx) => ({
    ...item,
    icon: Video,
    color: videoGuidesColors[idx % videoGuidesColors.length]
  }));

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>{toolPages.backToHome || 'Back to Home'}</span>
          </button>

          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-lg transition-all"
          >
            <Award className="w-4 h-4" />
            <span>{hub.quizBtn || 'Take Cyber Awareness Quiz & Earn Certificate'}</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white rounded-[28px] shadow-2xl space-y-4 border border-slate-800">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{hub.heroBadge || 'National Citizen Awareness Repository'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {toolPages.hubTitle || hub.title || 'Cyber Safety Awareness Hub'}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-bold max-w-3xl leading-relaxed">
            {toolPages.hubDesc || hub.subtitle || 'Educational articles, government awareness posters, cyber safety videos, RBI/NPCI guidelines, and specialized tips for farmers, senior citizens, women, and students.'}
          </p>
        </div>

        {/* Category 1: Audience Specific Tips */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>{hub.section1Title || 'Tailored Safety Guides for Every Citizen Group'}</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {citizenGuidesList.map((guide, idx) => {
              const IconComp = guide.icon;
              return (
                <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-3 hover:-translate-y-1 transition-all">
                  <div className={`w-12 h-12 rounded-2xl ${guide.color} text-white flex items-center justify-center shadow-md`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{guide.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">{guide.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category 2: Official Government Awareness Posters & Advisories */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-secondary" />
            <span>{hub.section2Title || 'Government & RBI Official Awareness Advisories'}</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {govPostersList.map((poster, idx) => (
              <div key={idx} className={`p-6 rounded-[24px] border shadow-xl space-y-4 ${poster.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-white/80 dark:bg-black/40 px-3 py-1 rounded-full">{poster.type}</span>
                  <poster.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black leading-snug">{poster.title}</h3>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-black hover:underline"
                >
                  <span>{hub.viewAdvisory || 'View Official Advisory'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Category 3: Video Awareness Guides */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600" />
            <span>{hub.section3Title || 'Animated Cyber Safety Video Guides'}</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {videoGuidesList.map((video, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${video.color} text-white flex items-center justify-center shadow-md`}>
                    <video.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase text-slate-500">{video.length}</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{video.title}</h3>
                </div>

                <button className="w-full py-3 bg-primary hover:bg-primary-light text-white text-xs font-black rounded-xl shadow-md transition-all">
                  {hub.watchVideo || 'Watch Video Guide'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default AwarenessHubPage;
