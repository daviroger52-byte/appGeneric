import React from 'react';

const RadarChart = ({ data, theme }) => {
  const size = 200;
  const center = size / 2; const radius = 70;
  const getCoordinates = (value, index) => { const angle = index * ((Math.PI * 2) / data.length) - Math.PI / 2;
  const r = (value / 100) * radius; return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };
  const points = data.map((d, i) => { const {x,y} = getCoordinates(d.value, i); return `${x},${y}`; }).join(' ');
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0'; const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  return (
    <div className="flex flex-col items-center"><svg width={size} height={size} className="overflow-visible">{[0.25, 0.5, 0.75, 1].map((level, idx) => (<polygon key={idx} points={data.map((_, i) => { const {x,y} = getCoordinates(100*level, i); return `${x},${y}`; }).join(' ')} fill="none" stroke={gridColor} strokeWidth="1" />))}<polygon points={points} fill="rgba(168, 85, 247, 0.3)" stroke="#a855f7" strokeWidth="2" />{data.map((d, i) => { const { x, y } = getCoordinates(115, i); return (<text key={i} x={x} y={y} textAnchor="middle" dy="0.3em" className="text-[10px] font-bold uppercase" fill={textColor}>{d.label}</text>); })}</svg></div>
  );
};

export default RadarChart;