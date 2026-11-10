import React from 'react';

export const Logo = ({ className = "h-10 w-auto", showText = true }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        className={className}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F4C81" />
            <stop offset="100%" stopColor="#1B64A5" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F4C81" floodOpacity="0.25" />
          </filter>
        </defs>

        <path
          d="M100 15 L170 45 V95 C170 142 138 178 100 190 C62 178 30 142 30 95 V45 L100 15 Z"
          fill="url(#blueGrad)"
          filter="url(#shadow)"
        />

        <path
          d="M100 25 L158 52 V95 C158 134 131 165 100 176 C69 165 42 134 42 95 V52 L100 25 Z"
          fill="#FFFFFF"
          fillOpacity="0.15"
          stroke="url(#goldGrad)"
          strokeWidth="3"
        />

        <path
          d="M82 85 V72 C82 62 90 54 100 54 C110 54 118 62 118 72 V85"
          stroke="url(#greenGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        <rect
          x="75"
          y="85"
          width="50"
          height="45"
          rx="8"
          fill="url(#greenGrad)"
        />

        <circle cx="100" cy="103" r="6" fill="#FFFFFF" />
        <path d="M100 107 V117" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

        <polygon points="100,32 103,40 111,40 104,45 107,53 100,48 93,53 96,45 89,40 97,40" fill="url(#goldGrad)" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-lg sm:text-xl tracking-tight text-primary dark:text-white leading-tight flex items-center gap-1.5">
            UPI <span className="text-secondary">Suraksha</span> Mitra
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-300 mt-0.5">
            Protecting Every Digital Payment Through <span className="text-secondary font-black">Awareness</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
