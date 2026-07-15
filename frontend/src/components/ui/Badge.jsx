import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Badge = ({ children, variant = 'blue', className = '' }) => {
  const { isDarkMode } = useTheme();

  const variants = {
    blue: isDarkMode ? 'bg-[#000000]/15 text-[#ffffff] border-[#000000]/30' : 'bg-[#000000]/10 text-[#000000] border-[#000000]/25',
    primary: isDarkMode ? 'bg-[#000000]/15 text-[#ffffff] border-[#000000]/30' : 'bg-[#000000]/10 text-[#000000] border-[#000000]/25',
    emerald: isDarkMode ? 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: isDarkMode ? 'bg-rose-900/30 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200',
    amber: isDarkMode ? 'bg-amber-900/30 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200',
    slate: isDarkMode ? 'bg-white/5 text-slate-300 border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${variants[variant] || variants.blue} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
