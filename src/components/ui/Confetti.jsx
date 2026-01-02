import React, { useEffect, useRef } from 'react';

const Confetti = ({ active }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let particles = [];
        const colors = ['#a855f7', '#3b82f6', '#ef4444', '#eab308', '#22c55e'];
        for (let i = 0; i < 150; i++) {
          particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height, color: colors[Math.floor(Math.random() * colors.length)], size: Math.random() * 5 + 2, speedY: Math.random() * 5 + 2, speedX: Math.random() * 4 - 2, rotation: Math.random() * 360, rotationSpeed: Math.random() * 10 - 5 });
        }
        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          particles.forEach((p, index) => {
                p.y += p.speedY; p.x += p.speedX; p.rotation += p.rotationSpeed;
                ctx.save();
                ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
                if (p.y > canvas.height) particles.splice(index, 1);
            });
            if (particles.length > 0) animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationId);
    }, [active]);
    if (!active) return null;
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
};

export default Confetti;