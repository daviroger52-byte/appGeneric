import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, theme, modalClasses }) {
  if (!isOpen) return null;

  // Se modalClasses não for passado, usa um fallback básico para evitar erros
  const classes = modalClasses || {
      innerBg: theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className={`relative w-full max-w-md rounded-3xl shadow-2xl animate-slideUp border ${classes.innerBg} my-8`}>
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}