import React from 'react';
import { motion } from 'framer-motion';
import { Package, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const blobs = [
  { className: 'top-[-15%] left-[-12%] w-[42%] h-[42%] bg-sunset-gradient-soft' },
  { className: 'bottom-[-18%] right-[-15%] w-[46%] h-[46%] bg-[radial-gradient(circle,#c7e9f5_0%,transparent_70%)] opacity-70' },
  { className: 'top-[35%] right-[8%] w-[24%] h-[24%] bg-[radial-gradient(circle,#b8a4ff33_0%,transparent_70%)]' },
];

/**
 * AuthShell — wraps Login/Register với airy minimal canvas, theme toggle, brand mark.
 * Children render vào glass card pill.
 */
const AuthShell = ({ title, subtitle, children, footer }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-['Plus_Jakarta_Sans'] transition-colors duration-500">
      {/* Soft floating orbs */}
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[120px] animate-float pointer-events-none ${b.className}`}
          style={{ animationDelay: `${i * 1.4}s` }}
        />
      ))}

      {/* Dotted grid subtle */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#9f4122 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          aria-label="Đổi giao diện sáng/tối"
          className="glass-card-soft w-12 h-12 rounded-full flex items-center justify-center text-ink-muted hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Brand mark top-left */}
      <div className="absolute top-7 left-7 z-20 flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-10 h-10 rounded-[var(--radius-pill)] bg-sunset-gradient flex items-center justify-center shadow-warm-glow"
        >
          <Package size={18} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="hidden sm:flex flex-col leading-none"
        >
          <span className="font-extrabold text-[15px] tracking-tight text-ink">QL KHO</span>
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-ink-subtle mt-1">
            Warehouse Suite
          </span>
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] mx-4 z-10"
      >
        <div className="glass-card rounded-[var(--radius-card-lg)] overflow-hidden">
          {/* Top accent gradient strip */}
          <div className="h-1.5 bg-sunset-gradient" />

          <div className="p-10 sm:p-12">
            <div className="text-center mb-10">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-[34px] font-extrabold tracking-[-0.04em] text-ink mb-2"
              >
                {title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-[15px] text-ink-muted font-medium"
              >
                {subtitle}
              </motion.p>
            </div>

            {children}
          </div>
        </div>

        {footer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-7 text-center text-[10px] font-bold tracking-[0.22em] uppercase text-ink-subtle/70"
          >
            {footer}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthShell;
