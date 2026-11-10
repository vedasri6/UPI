import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  ShieldCheck
} from 'lucide-react';

export const RegisterPage = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field Validation Errors
  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    let err = '';
    if (field === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        err = 'Please enter a valid email address';
      }
    }
    if (field === 'phone' && value) {
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        err = 'Phone number must be at least 10 digits';
      }
    }
    if (field === 'confirmPassword' && value) {
      if (value !== password) {
        err = 'Passwords do not match';
      }
    }
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const getStrengthLabel = (score) => {
    if (score === 0) return { label: 'None', color: 'bg-slate-300 dark:bg-slate-700' };
    if (score <= 25) return { label: 'Weak', color: 'bg-red-500' };
    if (score <= 50) return { label: 'Fair', color: 'bg-amber-500' };
    if (score <= 75) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong & Safe', color: 'bg-emerald-500' };
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    if (errors.email || errors.phone || errors.confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      name,
      full_name: name,
      email,
      phone,
      village,
      district,
      state,
      password,
      role: 'user'
    });
    setIsSubmitting(false);

    if (res.success) {
      navigate('/login', { state: { registered: true, registeredEmail: email } });
    }
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark transition-colors duration-300 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10 w-full flex-grow flex flex-col justify-center">
        
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs mb-6 w-fit transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.toolPages.backToHome}</span>
        </button>

        <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-secondary/10 dark:bg-secondary/20 text-secondary rounded-2xl flex items-center justify-center mx-auto border border-secondary/20">
              <UserPlus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.auth.registerTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {t.auth.registerDesc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.fullName} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-11 pr-4 py-3.5 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.email} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField('email', e.target.value);
                  }}
                  placeholder="ramesh@village.in"
                  className={`w-full pl-11 pr-4 py-3.5 text-sm font-semibold rounded-2xl border ${
                    errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none`}
                />
              </div>
              {errors.email && (
                <span className="text-[11px] text-red-500 font-bold block mt-1">{errors.email}</span>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.phone}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    validateField('phone', e.target.value);
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full pl-11 pr-4 py-3.5 text-sm font-semibold rounded-2xl border ${
                    errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none`}
                />
              </div>
              {errors.phone && (
                <span className="text-[11px] text-red-500 font-bold block mt-1">{errors.phone}</span>
              )}
            </div>

            {/* Village, District, State Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.auth.village}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Rampur"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.auth.district}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Guntur"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t.auth.state}
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Andhra Pradesh"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.password} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (confirmPassword) validateField('confirmPassword', confirmPassword);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-500">{t.auth.passwordStrength}</span>
                    <span className="text-slate-900 dark:text-white">{strengthInfo.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthInfo.color} transition-all duration-300`}
                      style={{ width: `${strengthScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.auth.confirmPassword} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateField('confirmPassword', e.target.value);
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 text-sm font-semibold rounded-2xl border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none`}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 font-bold block mt-1">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !!errors.email || !!errors.phone || !!errors.confirmPassword}
              className="w-full py-4 bg-secondary hover:bg-emerald-600 disabled:opacity-50 text-slate-900 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span>{t.auth.registerBtn}</span>
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
            {t.auth.alreadyAccount}{' '}
            <Link to="/login" className="text-primary dark:text-secondary font-extrabold hover:underline">
              {t.auth.loginBtn}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
