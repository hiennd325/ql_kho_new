import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', noPadding = false, hover = true }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      whileHover={hover ? { y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } : {}}
      className={`rounded-[32px] border shadow-sm transition-all duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      } ${noPadding ? '' : 'p-6'} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
