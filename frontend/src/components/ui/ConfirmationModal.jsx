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
      bg: isDarkMode ? 'bg-rose-900/20' : 'bg-rose-50',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
    },
    warning: {
      icon: <AlertCircle className="text-amber-500" size={32} />,
      bg: isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
    },
    info: {
      icon: <AlertCircle className="text-blue-500" size={32} />,
      bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className={`p-4 rounded-2xl mb-6 ${style.bg}`}>
                {style.icon}
              </div>

              <h3 className={`text-xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h3>

              <p className={`text-sm font-medium mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {message}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3.5 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${style.button}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
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
