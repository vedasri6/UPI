import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { 
  Home,
  BookOpen,
  ShieldCheck,
  Bot,
  QrCode,
  Link2,
  MessageSquare,
  ImageIcon,
  ShieldAlert,
  FileText,
  LayoutDashboard,
  User,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  PhoneCall,
  ChevronDown,
  Lock,
  Wrench,
  Smartphone,
  Eye
} from 'lucide-react';

export const Navbar = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { textSize, cycleTextSize, highContrast, toggleHighContrast } = useAccessibility();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nav = t.nav || {};

  const safetyToolsDropdown = [
    { name: nav.aiAssistant || 'AI Fraud Assistant', path: '/ai-assistant', icon: Bot },
    { name: nav.practiceUpi || 'Practice UPI Simulator', path: '/practice-upi', icon: Smartphone },
    { name: nav.upiVerifier || 'UPI Handle Verifier', path: '/upi-verifier', icon: ShieldCheck },
    { name: nav.qrScanner || 'QR Scanner Simulation', path: '/qr-scanner', icon: QrCode },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-bgDark/95 backdrop-blur-xl shadow-lg py-2.5 border-b border-slate-200/80 dark:border-slate-800/80' 
        : 'bg-white/90 dark:bg-bgDark/90 backdrop-blur-md py-3.5 border-b border-slate-100 dark:border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group">
            <Logo className="h-10 sm:h-12 w-auto" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            
            {/* 1. HOME */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                location.pathname === '/' ? 'bg-primary text-white shadow-md' : 'text-slate-700 dark:text-slate-200 hover:text-primary'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{nav.home || 'Home'}</span>
            </Link>

            {/* 2. SCAM TYPES */}
            <Link
              to="/scams"
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                location.pathname === '/scams' ? 'bg-primary text-white shadow-md' : 'text-slate-700 dark:text-slate-200 hover:text-primary'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{nav.scamTypes || 'Scam Types'}</span>
            </Link>

            {/* 3. SAFETY TOOLS Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  ['/ai-assistant', '/upi-verifier', '/qr-scanner', '/safety-tools', '/practice-upi'].includes(location.pathname)
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-200 hover:text-primary'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{nav.features || 'Safety Tools'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {toolsDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in"
                  onMouseLeave={() => setToolsDropdownOpen(false)}
                >
                  <Link
                    to="/safety-tools"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-black text-primary dark:text-sky-400 border-b border-slate-100 dark:border-slate-700 mb-1"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>{nav.features || 'All Safety Tools'}</span>
                  </Link>

                  {safetyToolsDropdown.map((item) => (
                    <Link
                      key={item.path + item.name}
                      to={item.path}
                      onClick={() => setToolsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-primary dark:text-sky-400" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 4. SECURITY PROTOCOLS */}
            <Link
              to="/security-protocols"
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                location.pathname === '/security-protocols' ? 'bg-primary text-white shadow-md' : 'text-slate-700 dark:text-slate-200 hover:text-primary'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              <span>{nav.securityProtocols || 'Security Protocols'}</span>
            </Link>

            {/* 5. AWARENESS HUB */}
            <Link
              to="/awareness-hub"
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                location.pathname === '/awareness-hub' ? 'bg-primary text-white shadow-md' : 'text-slate-700 dark:text-slate-200 hover:text-primary'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>{nav.awarenessHub || 'Awareness Hub'}</span>
            </Link>

            {/* 6. COMMUNITY REPORTS */}
            <Link
              to="/report-scam"
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                location.pathname === '/report-scam' ? 'bg-primary text-white shadow-md' : 'text-slate-700 dark:text-slate-200 hover:text-primary'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>{nav.communityReports || 'Report Fraud'}</span>
            </Link>

            {/* 7. EMERGENCY */}
            <Link
              to="/emergency"
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                location.pathname === '/emergency' ? 'bg-red-600 text-white shadow-md' : 'text-red-600 dark:text-red-400 hover:bg-red-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{nav.emergency || 'Emergency 1930'}</span>
            </Link>

          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center space-x-2">
            
            {/* Call 1930 Helpline Button */}
            <a
              href="tel:1930"
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md hover:scale-105"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>{nav.callHelpline || 'Call 1930'}</span>
            </a>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 ${
                        language === lang.code ? 'text-primary font-black bg-slate-50 dark:bg-slate-700/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{lang.label}</span>
                      <span>{lang.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Text Size Accessibility Toggle */}
            <button
              onClick={cycleTextSize}
              className="px-2.5 py-1.5 text-xs font-black text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all"
              title={language === 'te' ? `అక్షర పరిమాణం: ${textSize === 'normal' ? 'సాధారణ (18px)' : textSize === 'large' ? 'పెద్దది (20.5px)' : 'చాలా పెద్దది (23px)'}` : `Text Size: ${textSize.toUpperCase()}`}
              aria-label={`Adjust text size for elders. Current size: ${textSize}`}
            >
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Text</span>
              <span className="text-xs font-black text-primary dark:text-sky-400">
                {textSize === 'normal' ? 'A' : textSize === 'large' ? 'A+' : 'A++'}
              </span>
            </button>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`p-2 rounded-xl border transition-all ${
                highContrast 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
              title={language === 'te' ? "హై కాంట్రాస్ట్ మోడ్" : "High Contrast Mode"}
              aria-label="Toggle high contrast accessibility display"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Dashboard / Profile / Login */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-xs font-black text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  {nav.dashboard || 'Dashboard'}
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-2 bg-primary hover:bg-primary-light text-white text-xs font-black rounded-xl shadow-md"
                >
                  {nav.settings || 'Profile'}
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-2 bg-primary hover:bg-primary-light text-white text-xs font-black rounded-xl shadow-md"
              >
                {nav.login || 'Login'}
              </Link>
            )}
          </div>

          {/* Mobile Navigation Header Items */}
          <div className="flex items-center lg:hidden space-x-1.5">
            <a
              href="tel:1930"
              className="p-2 bg-red-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md animate-pulse"
              aria-label="Call National Cyber Crime Helpline 1930"
            >
              <PhoneCall className="w-4 h-4" />
              <span>1930</span>
            </a>

            <button
              onClick={cycleTextSize}
              className="p-2 text-xs font-black text-primary dark:text-sky-400 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              title="Adjust Text Size"
              aria-label="Adjust text size"
            >
              {textSize === 'normal' ? 'A' : textSize === 'large' ? 'A+' : 'A++'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              aria-label="Toggle dark/light theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 animate-in slide-in-from-top-4">
            
            {/* Language & Accessibility Bar in Mobile */}
            <div className="flex flex-col gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" />
                  {nav.language || 'Language'}:
                </span>
                <div className="flex space-x-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all ${
                        language === lang.code
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {language === 'te' ? "అక్షర పరిమాణం (Text Size):" : "Accessibility Text Size:"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={cycleTextSize}
                    className="px-3 py-1 text-xs font-black bg-slate-100 dark:bg-slate-700 text-primary dark:text-sky-400 rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    {textSize === 'normal' ? 'Normal (18px)' : textSize === 'large' ? 'Large (20.5px)' : 'Extra Large (23px)'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 text-xs font-black">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.home || 'Home'}</Link>
              <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-primary font-black rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span>{nav.aiAssistant || 'AI Fraud Assistant'}</span>
              </Link>
              <Link to="/scams" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.scamTypes || 'Scam Types'}</Link>
              <Link to="/safety-tools" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.features || 'Safety Tools'}</Link>
              <Link to="/security-protocols" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.securityProtocols || 'Security Protocols'}</Link>
              <Link to="/awareness-hub" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.awarenessHub || 'Awareness Hub'}</Link>
              <Link to="/practice-upi" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.practiceUpi || 'Practice UPI'}</Link>
              <Link to="/report-scam" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.communityReports || 'Report Fraud'}</Link>
              <Link to="/emergency" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-red-600 rounded-xl hover:bg-red-50 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{nav.emergency || 'Emergency 1930'}</span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.dashboard || 'Dashboard'}</Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100">{nav.settings || 'Profile'}</Link>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-primary rounded-xl hover:bg-slate-100">{nav.login || 'Login'}</Link>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col space-y-2">
              <a
                href="tel:1930"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>{nav.callHelpline || 'Call 1930'}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
