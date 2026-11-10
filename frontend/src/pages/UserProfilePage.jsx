import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  Globe,
  Languages,
  ShieldCheck, 
  Save, 
  ArrowLeft, 
  LogOut, 
  Loader2,
  Sparkles,
  Camera
} from 'lucide-react';

export const UserProfilePage = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [state, setState] = useState(user?.state || '');
  const [selectedLang, setSelectedLang] = useState(user?.language || language || 'en');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || user.full_name || '');
      setPhone(user.phone || '');
      setVillage(user.village || '');
      setDistrict(user.district || '');
      setState(user.state || '');
      setSelectedLang(user.language || language || 'en');
      setProfilePhoto(user.profilePhoto || '');
    }
  }, [user]);

  const handlePhoneChange = (val) => {
    setPhone(val);
    const clean = val.replace(/\D/g, '');
    if (val && clean.length < 10) {
      setPhoneError('Phone number must be at least 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (phoneError) return;

    setIsSubmitting(true);
    await updateProfile({
      name,
      full_name: name,
      phone,
      village,
      district,
      state,
      language: selectedLang,
      profilePhoto
    });
    
    if (selectedLang !== language) {
      changeLanguage(selectedLang);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full flex-grow">
        
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs mb-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.toolPages?.backToHome || 'Back to Dashboard'}</span>
        </button>

        <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-8">
          
          {/* User Header Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative">
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-lg bg-slate-100 dark:bg-slate-900"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary text-white font-black text-2xl flex items-center justify-center shadow-lg uppercase">
                    {(name || 'U').charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 text-slate-600 rounded-full border border-slate-200 dark:border-slate-700">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {name || 'Citizen User'}
                </h1>
                <p className="text-xs text-slate-500 font-semibold">
                  {village ? `${village}, ${district}` : (user?.email || 'Citizen User')}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary dark:text-secondary text-xs font-bold uppercase">
                    {user?.role === 'admin' ? t.auth.roleAdmin : t.auth.roleUser}
                  </span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    user?.is_verified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {user?.is_verified ? t.auth.statusVerified : t.auth.statusUnverified}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-5 py-2.5 bg-red-50 dark:bg-red-950/60 text-red-600 border border-red-200 dark:border-red-800 rounded-xl text-xs font-extrabold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.auth.logout}</span>
            </button>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.auth.profileSubtitle || 'Personal & Location Information'}
            </h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Email (Disabled) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.email} (Primary Identifier)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-11 pr-4 py-3 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-950 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.phone}
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full pl-11 pr-4 py-3 text-sm font-semibold rounded-2xl border ${
                    phoneError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none`}
                />
              </div>
              {phoneError && (
                <span className="text-xs text-red-500 font-bold block mt-1">{phoneError}</span>
              )}
            </div>

            {/* Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t.auth.village}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Rampur"
                    className="w-full pl-10 pr-3 py-3 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t.auth.district}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Guntur"
                    className="w-full pl-10 pr-3 py-3 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t.auth.state}
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Andhra Pradesh"
                    className="w-full pl-10 pr-3 py-3 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Language & Photo Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t.auth.language}
                </label>
                <div className="relative">
                  <Languages className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t.auth.profilePhoto}
                </label>
                <input
                  type="text"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !!phoneError}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{t.auth.saveChangesBtn}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
