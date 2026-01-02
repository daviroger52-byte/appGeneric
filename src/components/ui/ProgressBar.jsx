import React from 'react';

const ProgressBar = ({ current, max, colorClass, height = "h-3", theme }) => {
  const percentage = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  return (
    <div className={`${height} w-full rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
      <div className={`h-full ${colorClass} transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

export default ProgressBar;