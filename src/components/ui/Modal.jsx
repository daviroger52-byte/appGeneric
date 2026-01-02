import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, theme }) => {
  if (!isOpen) return null;
  const bgClass = theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className={`${bgClass} border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col`}>
        <div className={`flex justify-center items-center p-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'} flex-shrink-0 relative`}>
          <h3 className={`text-xl font-bold text-center ${textClass}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="absolute right-4 p-2 hover:opacity-70 rounded-full transition-colors"><X size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} /></button>
        </div>
        <div className="p-6 overflow-y-auto scrollbar-hide">{children}</div>
      </div>
    </div>
  );
};

export default Modal;