export default function LoadingBar({ progress = 0, className = '', showPercentage = true }) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={className}>
      <div className="w-64 h-4 border-2 border-[#1467C3] bg-[#0f2a44] mx-auto relative">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${safeProgress}%`,
            background: 'linear-gradient(90deg, #FDC101, #FFE401, #389FE1, #1467C3)',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {showPercentage ? (
        <p className="mt-2 text-xs font-vcr text-[#FFE401] text-center">
          {Math.floor(safeProgress)}%
        </p>
      ) : null}
    </div>
  );
}