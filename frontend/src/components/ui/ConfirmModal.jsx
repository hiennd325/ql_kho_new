import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', variant = 'danger' }) => {
  const { isDarkMode } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="p-6 text-center space-y-6">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${variant === 'danger' ? (isDarkMode ? 'bg-rose-900/20 text-rose-500' : 'bg-rose-100 text-rose-600') : (isDarkMode ? 'bg-blue-900/20 text-blue-500' : 'bg-blue-100 text-blue-600')}`}>
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {message}
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 ${variant === 'danger' ? (isDarkMode ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100') : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100')}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
