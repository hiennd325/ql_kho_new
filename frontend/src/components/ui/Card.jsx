import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', noPadding = false, hover = true }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      whileHover={hover ? { y: -6, transition: { duration: 0.2, ease: "easeOut" } } : {}}
      className={`rounded-[28px] border backdrop-blur-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-950/40 border-white/5 shadow-black/40 shadow-xl hover:shadow-black/60 hover:border-[#000000]/20' 
          : 'bg-white/40 border-white/50 shadow-slate-200/30 shadow-lg hover:shadow-slate-200/55 hover:border-[#000000]/20'
      } ${noPadding ? '' : 'p-6'} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
