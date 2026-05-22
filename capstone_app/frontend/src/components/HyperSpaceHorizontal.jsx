import { useEffect, useRef } from 'react';

export default function HyperspaceBackground() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    console.log('HyperspaceBackground mounted');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const starCount = 100;
    const speed = 1.5;

    // Star colors
    const colors = [
      '#FFE401',
      '#389FE1',
      '#F36F24',
      '#FFFFFF',
    ];

    const createStar = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 20 + 5,
      velocity: Math.random() * speed + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    starsRef.current = Array.from({ length: starCount }, createStar);

    const resetStar = (star) => {
      star.x = -50;
      star.y = Math.random() * canvas.height;
      star.length = Math.random() * 20 + 5;
      star.velocity = Math.random() * speed + 0.5;
      star.color = colors[Math.floor(Math.random() * colors.length)];
    };

    const hexToRgb = (hex) => {
      const cleanHex = hex.replace('#', '');

      const bigint = parseInt(cleanHex, 16);

      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        const prevX = star.x;

        star.x += star.velocity;

        if (star.x > canvas.width + 100) {
          resetStar(star);
          return;
        }

        const brightness = Math.min(1, star.velocity / speed + 0.2);

        const rgb = hexToRgb(star.color);

        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightness})`;
        ctx.lineWidth = Math.max(1, brightness * 2);

        ctx.beginPath();
        ctx.moveTo(prevX, star.y);
        ctx.lineTo(star.x + star.length, star.y);
        ctx.stroke();

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightness})`;

        ctx.beginPath();
        ctx.arc(star.x, star.y, brightness * 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
        background: '#000',
      }}
    />
  );
}