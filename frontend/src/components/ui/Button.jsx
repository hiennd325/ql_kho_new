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
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20',
    secondary: isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200',
    danger: isDarkMode ? 'bg-rose-900/20 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-800' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100',
    ghost: isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
    dark: isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800',
  };

  const baseStyles = 'flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthStyles} ${className}`}
    >
      {Icon && <Icon size={18} strokeWidth={3} className="transition-transform" />}
      {children}
    </button>
  );
};

export default Button;
