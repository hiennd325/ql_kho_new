import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color = 'blue', trend, detail }) => {
  const { isDarkMode } = useTheme();

  const colors = {
    blue: isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600',
    emerald: isDarkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
    rose: isDarkMode ? 'bg-rose-900/20 text-rose-400' : 'bg-rose-50 text-rose-600',
    amber: isDarkMode ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-600',
  };

  const glowColors = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    amber: 'bg-amber-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border shadow-sm flex flex-col gap-3 hover:shadow-md transition-all group relative overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 blur-2xl -mr-10 -mt-10 transition-opacity duration-500 opacity-0 group-hover:opacity-20 ${glowColors[color]}`}></div>

      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
            trend.startsWith('+')
            ? (isDarkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
            : (isDarkMode ? 'bg-rose-900/20 text-rose-400' : 'bg-rose-50 text-rose-600')
          }`}>
            {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-2xl font-black tracking-tighter tabular-nums truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
        {detail && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">{detail}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
