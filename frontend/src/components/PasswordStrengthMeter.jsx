import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Check, X } from 'lucide-react';

export const PasswordStrengthMeter = ({ password = '' }) => {
  const { t } = useLanguage();

  const reqs = [
    { label: t.auth?.passReqLength || "At least 6 characters", met: password.length >= 6 },
    { label: t.auth?.passReqUppercase || "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: t.auth?.passReqNumber || "Contains a number", met: /[0-9]/.test(password) },
    { label: t.auth?.passReqSpecial || "Contains special character (@$!%*?&)", met: /[@$!%*?&]/.test(password) }
  ];

  const score = reqs.filter(r => r.met).length;

  const getLabelAndColor = () => {
    if (!password) return { label: '', color: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-400', pct: 0 };
    switch (score) {
      case 1:
        return { label: t.auth?.passStrengthWeak || 'Weak', color: 'bg-rose-500', text: 'text-rose-500', pct: 25 };
      case 2:
        return { label: t.auth?.passStrengthMedium || 'Medium', color: 'bg-amber-500', text: 'text-amber-500', pct: 50 };
      case 3:
        return { label: t.auth?.passStrengthStrong || 'Strong', color: 'bg-blue-500', text: 'text-blue-500', pct: 75 };
      case 4:
        return { label: t.auth?.passStrengthExcellent || 'Excellent', color: 'bg-emerald-500', text: 'text-emerald-500', pct: 100 };
      default:
        return { label: t.auth?.passStrengthWeak || 'Weak', color: 'bg-rose-500', text: 'text-rose-500', pct: 10 };
    }
  };

  const status = getLabelAndColor();

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2 text-xs">
      {/* Strength Bar */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          Password Strength: <strong className={status.text}>{status.label}</strong>
        </span>
        <span className="text-slate-400 font-mono">{status.pct}%</span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${status.color}`}
          style={{ width: `${status.pct}%` }}
        />
      </div>

      {/* Criteria list */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {reqs.map((req, idx) => (
          <div key={idx} className="flex items-center space-x-1">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            )}
            <span className={`text-[11px] ${req.met ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
