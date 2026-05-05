import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Badge = ({ children, variant = 'blue', className = '' }) => {
  const { isDarkMode } = useTheme();

  const variants = {
    blue: isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: isDarkMode ? 'bg-rose-900/20 text-rose-400 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-100',
    amber: isDarkMode ? 'bg-amber-900/20 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-100',
    slate: isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200/50',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${variants[variant] || variants.blue} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
