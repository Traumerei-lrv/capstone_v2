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

    const starCount = 2000;
    const speed = 0.5;

    // Star colors
    const colors = [
      '#FFE401',
      '#389FE1',
      '#F36F24',
      '#FFFFFF',
    ];

    const createStar = () => ({
      x: Math.random() * canvas.width * 2 - canvas.width,
      y: Math.random() * canvas.height * 2 - canvas.height,
      z: Math.random() * 0.9 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    starsRef.current = Array.from({ length: starCount }, createStar);

    const resetStar = (star) => {
      star.x = Math.random() * canvas.width * 2 - canvas.width;
      star.y = Math.random() * canvas.height * 2 - canvas.height;
      star.z = 0.1;
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
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        const prevX = centerX + star.x / star.z;
        const prevY = centerY + star.y / star.z;

        star.z -= 0.0035 * speed;

        if (star.z <= 0.001) {
          resetStar(star);
          return;
        }

        const sx = centerX + star.x / star.z;
        const sy = centerY + star.y / star.z;

        if (
          sx < -200 ||
          sx > canvas.width + 200 ||
          sy < -200 ||
          sy > canvas.height + 200
        ) {
          resetStar(star);
          return;
        }

        const brightness = Math.max(0.2, Math.min(1, 1 - star.z));

        const rgb = hexToRgb(star.color);

        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightness})`;
        ctx.lineWidth = Math.max(1, brightness * 3);

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightness})`;

        const size = Math.max(1, brightness * 2.5);

        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
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
      }}
    />
  );
}