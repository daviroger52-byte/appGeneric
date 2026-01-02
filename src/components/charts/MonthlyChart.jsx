import React from 'react';

const MonthlyChart = ({ data, theme }) => {
    const height = 150;
    const width = 300;
    if (!data || data.length < 2) return <div className={`text-xs ${theme === 'dark' ?
    'text-slate-500' : 'text-slate-400'} h-[150px] flex items-center justify-center`}>Acumule XP em dias diferentes para ver o gráfico.</div>;
    const maxVal = Math.max(...data.map(d => d.xp)) || 100;
    const points = data.map((d, i) => { const x = (i / (data.length - 1)) * width; const y = height - (d.xp / maxVal) * (height - 20) - 10; return `${x},${y}`; }).join(' ');
    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible"><polyline fill="none" stroke="#a855f7" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round"/>{data.map((d, i) => { const x = (i / (data.length - 1)) * width; const y = height - (d.xp / maxVal) * (height - 20) - 10; return (<g key={i} className="group"><circle cx={x} cy={y} r="4" fill={theme === 'dark' ? '#fff' : '#000'} className="transition-all group-hover:r-6" /><text x={x} y={y - 10} textAnchor="middle" className="text-[10px] opacity-0 group-hover:opacity-100 fill-current" style={{fontSize: '10px'}}>{d.xp}</text></g>) })}<text x={0} y={height + 15} className={`text-[10px] ${theme==='dark'?'fill-slate-500':'fill-slate-400'}`}>{new Date(data[0].date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</text><text x={width} y={height + 15} textAnchor="end" className={`text-[10px] ${theme==='dark'?'fill-slate-500':'fill-slate-400'}`}>{new Date(data[data.length-1].date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</text></svg>
    );
};

export default MonthlyChart;