import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color = 'blue', trend, detail, compact = false }) => {
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

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          flex: 2,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        className={`p-6 rounded-[24px] border-2 shadow-xl flex items-center justify-between gap-6 transition-all group relative overflow-hidden flex-1 min-w-0 ${
          isDarkMode
          ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50 shadow-blue-900/10'
          : 'bg-white border-slate-100 hover:border-blue-500/30 shadow-slate-200/50'
        }`}
      >
        {/* Animated Background Glow */}
        <div className={`absolute -right-4 -top-4 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${glowColors[color]}`}></div>

        <div className="flex items-center gap-5 relative z-10 min-w-0 flex-1">
          <div className={`p-4 rounded-2xl shadow-inner flex-shrink-0 ${colors[color]}`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 truncate group-hover:whitespace-normal">{label}</p>
            <div className="flex flex-col">
              <h3
                title={value}
                className={`text-xl xl:text-2xl 2xl:text-3xl font-black tracking-tighter tabular-nums leading-none ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                } truncate group-hover:overflow-visible group-hover:whitespace-nowrap`}
              >
                {value}
              </h3>
              {detail && (
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1 opacity-70 italic truncate group-hover:whitespace-normal">
                  {detail}
                </span>
              )}
            </div>
          </div>
        </div>

        {trend && (
          <div className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all group-hover:scale-110 ${
            trend.startsWith('+')
            ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100')
            : (isDarkMode ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-100')
          }`}>
            {trend.startsWith('+') ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
            {trend}
          </div>
        )}
      </motion.div>
    );
  }

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
