import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  const { isDarkMode } = useTheme();

  const typeStyles = {
    danger: {
      icon: <AlertCircle className="text-rose-500" size={32} />,
      bg: isDarkMode ? 'bg-rose-900/30' : 'bg-rose-50',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
    },
    warning: {
      icon: <AlertCircle className="text-amber-500" size={32} />,
      bg: isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
    },
    info: {
      icon: <AlertCircle className="text-[#FF5E3A]" size={32} />,
      bg: isDarkMode ? 'bg-[#FF5E3A]/15' : 'bg-[#FF5E3A]/10',
      button: 'bg-gradient-to-r from-[#FF5E3A] to-[#e04520] hover:scale-105 shadow-[#FF5E3A]/25'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <div className="absolute w-64 h-64 bg-[#FF5E3A]/20 rounded-full blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            className={`relative rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border backdrop-blur-xl transition-all ${
              isDarkMode ? 'bg-slate-900/90 border-white/10 shadow-[#FF5E3A]/5' : 'bg-white/95 border-slate-200/80'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#FF5E3A] to-transparent opacity-60" />

            <div className="p-8 flex flex-col items-center text-center">
              <div className={`p-4 rounded-3xl mb-6 shadow-inner ${style.bg}`}>
                {style.icon}
              </div>

              <h3 className={`text-xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h3>

              <p className={`text-sm font-medium mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {message}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className={`flex-1 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                    isDarkMode ? 'text-slate-300 hover:bg-white/10 border border-white/10' : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3.5 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${style.button}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
