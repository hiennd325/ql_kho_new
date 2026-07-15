import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  icon: Icon,
  fullWidth = false
}) => {
  const { isDarkMode } = useTheme();

  const variants = {
    primary: 'bg-gradient-to-r from-[#000000] to-[#000000] text-white hover:scale-[1.02] shadow-lg shadow-[#000000]/25 border border-[#000000]/30',
    secondary: isDarkMode ? 'bg-white/5 text-slate-200 hover:bg-white/10 border-white/15 backdrop-blur-md' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm',
    danger: isDarkMode ? 'bg-rose-900/30 text-rose-300 hover:bg-rose-600 hover:text-white border-rose-500/30' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-200',
    ghost: isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
    dark: isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800',
  };

  const baseStyles = 'flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthStyles} ${className}`}
    >
      {Icon && <Icon size={18} strokeWidth={2.5} className="transition-transform" />}
      {children}
    </button>
  );
};

export default Button;
