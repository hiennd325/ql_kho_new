import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', variant = 'danger' }) => {
  const { isDarkMode } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="p-6 text-center space-y-6">
        <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner ${variant === 'danger' ? (isDarkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600') : (isDarkMode ? 'bg-[#000000]/15 text-[#000000]' : 'bg-[#000000]/10 text-[#000000]')}`}>
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        <p className={`text-sm font-bold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {message}
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700 border border-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200'}`}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25' : 'bg-gradient-to-r from-[#000000] to-[#000000] hover:scale-105 shadow-[#000000]/25'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
