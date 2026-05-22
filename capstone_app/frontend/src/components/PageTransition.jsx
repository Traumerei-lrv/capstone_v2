import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function PageTransition({ onComplete }) {
  const circleRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete,
    });

    gsap.set(circleRef.current, {
      scale: 0,
      xPercent: -50,
      yPercent: -50,
    });

    tl.to(circleRef.current, {
      scale: 30,
      duration: 0.9,
      ease: 'power4.inOut',
    })
      .to(circleRef.current, {
        scale: 0,
        duration: 0.9,
        ease: 'power4.inOut',
      });

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div
        ref={circleRef}
        className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-black"
      />
    </div>
  );
}