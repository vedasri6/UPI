import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import { 
  PhoneCall, 
  ExternalLink, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  FileText, 
  Info, 
  Lock,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();
  const footer = t.footer || {};
  const nav = t.nav || {};

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1 & 2: Brand Info & Emergency Hotline Banner Box */}
          <div className="lg:col-span-2 space-y-5">
            <Logo className="h-12 w-auto" showText={true} />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md font-medium">
              {footer.tagline || 'National Indian Citizen Cyber Safety Portal dedicated to protecting farmers, students, senior citizens, and digital payment users against UPI scams, OTP theft, and QR frauds.'}
            </p>

            {/* Emergency Hotline Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-red-900/60 to-slate-900 border border-red-800/80 space-y-2 shadow-xl">
              <div className="text-[11px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                <PhoneCall className="w-4 h-4 animate-pulse text-red-400" />
                <span>{footer.cyberHelpline || 'National Cyber Crime Helpline'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <a
                  href="tel:1930"
                  className="text-2xl sm:text-3xl font-black text-white hover:text-red-300 transition-colors tracking-wider"
                  title="Immediately open phone dialer for 1930"
                >
                  1930
                </a>
                <a
                  href="tel:1930"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  {nav.callHelpline || 'Call 1930 Now'}
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>{footer.quickLinks || 'Quick Links'}</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-bold text-slate-400">
              <li><Link to="/" className="hover:text-primary transition-colors">{nav.home || 'Home'}</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-primary transition-colors">{nav.aiAssistant || 'AI Assistant'}</Link></li>
              <li><Link to="/upi-verifier" className="hover:text-primary transition-colors">{nav.upiVerifier || 'UPI Verifier'}</Link></li>
              <li><Link to="/qr-scanner" className="hover:text-primary transition-colors">{nav.qrScanner || 'QR Scanner'}</Link></li>
              <li><Link to="/awareness-hub" className="hover:text-primary transition-colors">{nav.awarenessHub || 'Awareness Hub'}</Link></li>
              <li><Link to="/emergency" className="hover:text-primary transition-colors">{nav.emergency || 'Emergency'}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{nav.about || 'About Us'}</Link></li>
            </ul>
          </div>

          {/* Column 4: Official Security Directives */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-secondary" />
              <span>{footer.safetyDirectives || 'Safety Directives'}</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-bold text-slate-400">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" /> {footer.npciBadge || 'NPCI Security Guidelines'}</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" /> {footer.rbiBadge || 'RBI Digital Banking Directives'}</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" /> {footer.certInBadge || 'CERT-In Cyber Safety Standards'}</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" /> {footer.neverShareOtpPin || 'Never Share 6-Digit OTP / PIN'}</li>
            </ul>
          </div>

          {/* Column 5: Official Government Support Portal & Developer Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span>{footer.govPortalTitle || 'Government Portal'}</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h5 className="text-xs font-black text-white">{footer.i4cBadge || 'Indian Cybercrime Coordination Centre (I4C)'}</h5>
              <p className="text-[11px] text-slate-400 font-medium">{footer.mhaDesc || 'Ministry of Home Affairs Official Cyber Crime Reporting'}</p>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-400 hover:text-sky-300 pt-1"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[11px] text-slate-500 font-medium pt-1">
              {footer.developerInfo || 'Academic Cybersecurity Research & Public Protection Initiative.'}
            </p>
          </div>

        </div>

        {/* Bottom Social & Copyright Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            {footer.rights || `© ${new Date().getFullYear()} UPI Suraksha Mitra. Designed for Public Awareness & Citizen Protection.`}
          </div>

          <div className="flex items-center space-x-3">
            <a href="#facebook" className="p-2 rounded-xl bg-slate-900 hover:bg-primary hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#twitter" className="p-2 rounded-xl bg-slate-900 hover:bg-sky-500 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#instagram" className="p-2 rounded-xl bg-slate-900 hover:bg-pink-600 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#youtube" className="p-2 rounded-xl bg-slate-900 hover:bg-red-600 hover:text-white transition-colors" aria-label="Youtube">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
