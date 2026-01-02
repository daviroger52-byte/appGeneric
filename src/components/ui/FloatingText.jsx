import React from 'react';

const FloatingText = ({ texts }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[110]">
            {texts.map(ft => (
                <div 
                    key={ft.id} 
                    className="absolute font-black text-xl md:text-2xl animate-float-slow whitespace-nowrap" 
                    style={{ 
                        left: ft.x, 
                        top: ft.y, 
                        color: ft.color, 
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        transform: 'translate(-50%, -50%)' // Para centralizar no ponto exato
                    }}
                >
                    {ft.text}
                 </div>
            ))}
        </div>
    );
};

export default FloatingText;