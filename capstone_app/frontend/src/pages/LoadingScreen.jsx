import { useEffect, useState } from "react";
import LoadingBar from "../components/LoadingBar";

const loadingSteps = [
  "Initializing world...",
  "Loading assets...",
  "Rendering pixels...",
  "Syncing data...",
  "Preparing dashboard...",
];

export default function LoadingScreen({ visible = true, message = "Preparing dashboard...", onComplete }) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [dissolving, setDissolving] = useState(false);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;

        if (next >= 100) {
          clearInterval(interval);
          setDissolving(true);
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            }
          }, 700);
        }

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [visible, onComplete]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    return undefined;
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const textTimer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1200);

    return () => clearInterval(textTimer);
  }, [visible]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0b1b2b',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 700ms ease-out',
        opacity: dissolving ? 0 : 1,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      aria-hidden={!visible}
    >

      {/* Pixel grid overlay */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '12px 12px'}} />

      <div className="text-center z-10">
        {/* Title */}
        <h1 className="text-3xl mb-6 tracking-widest font-minecraft text-[#FFE401] drop-shadow-[0_0_6px_#FDC101]">
          BALANGKAS
        </h1>

        {/* Loading text */}
        <p className="mb-4 text-sm font-vcr text-[#389FE1] h-6">
          {loadingSteps[textIndex]}
        </p>

        <LoadingBar progress={progress} />
        <p className="mt-4 text-[11px] font-vcr uppercase tracking-[0.35em] text-[#389FE1] opacity-80">
          {message}
        </p>
      </div>
    </div>
  );
}