function VizShell({ title, children }) {
  return (
    <div className="min-h-[280px] w-full overflow-hidden rounded-2xl border border-blue-200 bg-slate-950 p-3 shadow-inner sm:min-h-[340px] sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Simulation</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">{title}</p>
      </div>
      <div className="relative h-[250px] rounded-xl border border-blue-900/70 bg-[linear-gradient(180deg,#0b1730_0%,#081224_100%)] p-3 sm:h-[300px]">{children}</div>
    </div>
  );
}

function SubtopicOne() {
  const blocks = [
    { id: 'A', sx: -120, sy: -70, left: 24 },
    { id: 'B', sx: -90, sy: 80, left: 94 },
    { id: 'C', sx: 110, sy: -55, left: 164 },
    { id: 'D', sx: 130, sy: 65, left: 234 },
  ];

  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Scattered Data</p>
      <div className="mt-3 h-[170px] rounded-xl border border-blue-900/70 bg-slate-900/50 p-2">
        <div className="relative h-full">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="intro-viz-gather absolute top-[92px] flex h-10 w-12 items-center justify-center rounded-md border border-blue-200 bg-blue-500 text-xs font-black text-white"
              style={{
                left: `${block.left}px`,
                animationDelay: `${index * 0.22}s`,
                '--sx': `${block.sx}px`,
                '--sy': `${block.sy}px`,
              }}
            >
              {block.id}
            </div>
          ))}
          <div className="absolute bottom-2 left-2 right-2 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((slot) => (
              <div key={slot} className="h-10 rounded-md border border-blue-300/70 bg-blue-900/40" />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">Organized Structure</p>
    </>
  );
}

function SubtopicTwo({ selectedPill }) {
  const showLinear = selectedPill === 'Linear';
  const showNonLinear = selectedPill === 'Non-Linear';

  return (
    <div className="grid h-full gap-3 md:grid-cols-2">
      <div className={`rounded-xl border p-2 ${showLinear ? 'border-cyan-300 bg-cyan-500/10' : 'border-blue-900/70 bg-slate-900/45'}`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">Linear</p>
        <div className="mt-3 flex items-center justify-between">
          {['1', '2', '3', '4'].map((value, index) => (
            <div key={value} className="flex items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-md border text-xs font-black ${showLinear ? 'border-cyan-200 bg-cyan-500 text-white' : 'border-blue-300/60 bg-blue-800/70 text-blue-100'}`}>
                {value}
              </div>
              {index < 3 ? <div className={`mx-1 h-[2px] w-4 ${showLinear ? 'bg-cyan-200' : 'bg-blue-300/60'}`} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border p-2 ${showNonLinear ? 'border-violet-300 bg-violet-500/10' : 'border-blue-900/70 bg-slate-900/45'}`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">Non-Linear</p>
        <div className="relative mt-2 h-[130px]">
          <div className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full border border-violet-200 bg-violet-500 px-3 py-1 text-xs font-black text-white">A</div>
          <div className="absolute left-[26%] top-14 rounded-full border border-violet-200 bg-violet-600 px-3 py-1 text-xs font-black text-white">B</div>
          <div className="absolute right-[26%] top-14 rounded-full border border-violet-200 bg-violet-600 px-3 py-1 text-xs font-black text-white">C</div>
          <div className="absolute left-[15%] top-[105px] rounded-full border border-violet-200 bg-violet-700 px-3 py-1 text-xs font-black text-white">D</div>
          <div className="absolute right-[15%] top-[105px] rounded-full border border-violet-200 bg-violet-700 px-3 py-1 text-xs font-black text-white">E</div>
          <div className="absolute left-1/2 top-9 h-8 w-[2px] -translate-x-1/2 bg-violet-300/70" />
          <div className="absolute left-[33%] top-[58px] h-[2px] w-[34%] bg-violet-300/70" />
          <div className="absolute left-[24%] top-[86px] h-[2px] w-[12%] rotate-[28deg] bg-violet-300/70" />
          <div className="absolute right-[24%] top-[86px] h-[2px] w-[12%] -rotate-[28deg] bg-violet-300/70" />
        </div>
      </div>
    </div>
  );
}

function SubtopicThree({ selectedPill }) {
  const showPublic = selectedPill === 'Public Part';
  const showPrivate = selectedPill === 'Private Part';

  return (
    <div className="relative h-full">
      <div className={`mx-auto mt-8 h-[180px] max-w-[290px] rounded-xl border-2 ${showPrivate ? 'border-amber-300 bg-amber-500/10' : 'border-blue-300 bg-blue-900/30'} p-3`}>
        <p className="text-center text-xs font-black uppercase tracking-widest text-blue-100">ADT Box</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className={`intro-viz-spin h-10 w-10 rounded-full border-2 ${showPrivate ? 'border-amber-200 bg-amber-300/30' : 'border-blue-200 bg-blue-500/20'}`} />
          <div className={`intro-viz-spin h-8 w-8 rounded-full border-2 ${showPrivate ? 'border-amber-200 bg-amber-300/20' : 'border-blue-200 bg-blue-500/20'}`} style={{ animationDirection: 'reverse' }} />
        </div>
        <p className={`mt-6 text-center text-[10px] font-black uppercase tracking-widest ${showPrivate ? 'text-amber-200' : 'text-blue-200'}`}>Implementation Hidden</p>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {['Add', 'Access', 'Remove'].map((label) => (
          <button
            key={label}
            type="button"
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${showPublic ? 'border-cyan-200 bg-cyan-500 text-white' : 'border-blue-200 bg-blue-700/60 text-blue-100'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubtopicFour({ selectedPill }) {
  const mode = selectedPill || 'Readable';

  return (
    <div className="h-full space-y-3">
      <div className="mx-auto w-fit rounded-full border border-cyan-200 bg-cyan-500 px-4 py-1 text-xs font-black uppercase tracking-widest text-white">Add Data</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-xl border p-3 ${mode === 'Changeable' ? 'intro-viz-pulse border-amber-200 bg-amber-500/10' : 'border-blue-900/70 bg-slate-900/45'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Array Version</p>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[7, 8, 9, 10].map((item) => (
              <div key={item} className="rounded border border-amber-200/60 bg-amber-500/40 py-1 text-center text-[10px] font-black text-white">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${mode === 'Changeable' ? 'intro-viz-pulse border-violet-200 bg-violet-500/10' : 'border-blue-900/70 bg-slate-900/45'}`} style={{ animationDelay: '0.4s' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">Linked List Version</p>
          <div className="mt-2 flex items-center gap-1">
            {['N1', 'N2', 'N3'].map((item, index) => (
              <div key={item} className="flex items-center">
                <div className="rounded border border-violet-200/60 bg-violet-500/40 px-2 py-1 text-[10px] font-black text-white">{item}</div>
                {index < 2 ? <div className="mx-1 h-[2px] w-4 bg-violet-300/80" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {mode === 'Readable' ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-500/10 p-3 text-[10px] font-black uppercase tracking-widest text-emerald-200">
          Clear operation names: Add, Access, Remove
        </div>
      ) : null}
      {mode === 'Reusable' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-cyan-200 bg-cyan-500/10 p-3 text-center text-[10px] font-black uppercase tracking-widest text-cyan-200">Program A</div>
          <div className="rounded-xl border border-cyan-200 bg-cyan-500/10 p-3 text-center text-[10px] font-black uppercase tracking-widest text-cyan-200">Program B</div>
        </div>
      ) : null}
      {mode === 'Changeable' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-500/10 p-3 text-[10px] font-black uppercase tracking-widest text-amber-200">
          Same public operation, different internal implementation
        </div>
      ) : null}
    </div>
  );
}

function SubtopicFive({ selectedPill }) {
  const mode = selectedPill || 'Initialize';
  const base = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 rounded-xl border border-blue-900/70 bg-slate-900/50 p-3">
        {base.map((item, index) => {
          const isAccess = mode === 'Access' && index === 1;
          const isRemove = mode === 'Remove' && index === 3;
          const hideForInit = mode === 'Initialize';
          return (
            <div
              key={item}
              className={`relative h-11 rounded-md border border-blue-300/60 ${
                hideForInit ? 'bg-transparent' : 'bg-blue-700/55'
              } ${isAccess ? 'intro-viz-pulse border-emerald-200 bg-emerald-500/60' : ''} ${isRemove ? 'intro-viz-exit' : ''}`}
            >
              {!hideForInit ? <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">{item}</span> : null}
            </div>
          );
        })}
      </div>

      {mode === 'Add' ? (
        <div className="relative h-16">
          <div className="intro-viz-enter absolute left-2 top-2 rounded-md border border-cyan-200 bg-cyan-500 px-3 py-1 text-xs font-black text-white">NEW</div>
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-black uppercase tracking-widest text-blue-200">
        {['Initialize', 'Add', 'Access', 'Remove'].map((label) => (
          <span key={label} className={`${mode === label ? 'text-amber-200' : ''}`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SubtopicSix({ selectedPill }) {
  const mode = selectedPill || 'Stack';

  if (mode === 'Queue') {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">First-In, First-Out</p>
        <div className="flex items-center gap-2 rounded-xl border border-blue-900/70 bg-slate-900/50 p-3">
          {['A', 'B', 'C', 'D'].map((item, index) => (
            <div key={item} className={`h-10 w-10 rounded-md border border-cyan-200 bg-cyan-500 text-center text-xs font-black leading-10 text-white ${index === 0 ? 'intro-viz-pulse' : ''}`}>
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'Tree') {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Hierarchy</p>
        <div className="relative h-[170px] rounded-xl border border-blue-900/70 bg-slate-900/50 p-2">
          <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-emerald-200 bg-emerald-500 px-3 py-1 text-xs font-black text-white">Root</div>
          <div className="absolute left-[27%] top-16 rounded-full border border-emerald-200 bg-emerald-600 px-3 py-1 text-xs font-black text-white">L</div>
          <div className="absolute right-[27%] top-16 rounded-full border border-emerald-200 bg-emerald-600 px-3 py-1 text-xs font-black text-white">R</div>
          <div className="absolute left-[19%] top-[120px] rounded-full border border-emerald-200 bg-emerald-700 px-3 py-1 text-xs font-black text-white">LL</div>
          <div className="absolute right-[19%] top-[120px] rounded-full border border-emerald-200 bg-emerald-700 px-3 py-1 text-xs font-black text-white">RR</div>
        </div>
      </div>
    );
  }

  if (mode === 'Graph') {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-200">Vertices + Edges</p>
        <div className="relative h-[170px] rounded-xl border border-blue-900/70 bg-slate-900/50 p-2">
          {[
            { x: '16%', y: '20%', label: 'A' },
            { x: '45%', y: '10%', label: 'B' },
            { x: '74%', y: '28%', label: 'C' },
            { x: '30%', y: '66%', label: 'D' },
            { x: '64%', y: '70%', label: 'E' },
          ].map((node) => (
            <div
              key={node.label}
              className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-200 bg-fuchsia-500 text-center text-xs font-black leading-9 text-white"
              style={{ left: node.x, top: node.y }}
            >
              {node.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Last-In, First-Out</p>
      <div className="mx-auto flex w-24 flex-col-reverse gap-2 rounded-xl border border-blue-900/70 bg-slate-900/50 p-3">
        {['A', 'B', 'C', 'D'].map((item, index) => (
          <div key={item} className={`h-9 rounded-md border border-amber-200 bg-amber-500 text-center text-xs font-black leading-9 text-white ${index === 3 ? 'intro-viz-pulse' : ''}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubtopicSeven({ selectedPill }) {
  const mode = selectedPill || 'Definition';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 items-center gap-1 text-center text-[10px] font-black uppercase tracking-wide">
        {['Input', 'Step 1', 'Step 2', 'Step 3', 'Output'].map((label, index) => (
          <div key={label} className={`rounded-md border px-1 py-2 ${mode === 'Steps' && index > 0 && index < 4 ? `intro-viz-step-${index}` : ''} border-blue-300/70 bg-blue-900/50 text-blue-100`}>
            {label}
          </div>
        ))}
      </div>
      <div className="relative h-9 rounded-md border border-blue-900/70 bg-slate-900/45">
        <div className="intro-viz-pipeline-dot absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-cyan-300" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-md border p-2 text-[10px] font-black uppercase tracking-widest ${mode === 'Example' ? 'border-emerald-200 bg-emerald-500/10 text-emerald-200' : 'border-blue-900/70 bg-slate-900/45 text-blue-200'}`}>
          Input: 3, 1, 2
        </div>
        <div className={`rounded-md border p-2 text-[10px] font-black uppercase tracking-widest ${mode === 'Example' ? 'border-emerald-200 bg-emerald-500/10 text-emerald-200' : 'border-blue-900/70 bg-slate-900/45 text-blue-200'}`}>
          Output: 1, 2, 3
        </div>
      </div>
    </div>
  );
}

function SubtopicEight({ selectedPill }) {
  const items = ['Finiteness', 'Definiteness', 'Input', 'Output', 'Uniqueness'];
  const mode = selectedPill || 'Finiteness';

  return (
    <div className="grid h-full gap-3 md:grid-cols-[1fr_1fr]">
      <div className="space-y-2 rounded-xl border border-blue-900/70 bg-slate-900/45 p-2">
        {items.map((item) => (
          <div key={item} className={`rounded-md border px-2 py-2 text-[10px] font-black uppercase tracking-widest ${mode === item ? 'border-cyan-200 bg-cyan-500/20 text-cyan-100' : 'border-blue-300/40 bg-blue-900/45 text-blue-200'}`}>
            {item}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue-900/70 bg-slate-900/45 p-2">
        {mode === 'Finiteness' ? (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Process Ends</p>
            <div className="relative h-8 rounded bg-blue-900/60">
              <div className="intro-viz-progress h-full rounded bg-amber-400" />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white">Stop</div>
            </div>
          </div>
        ) : null}
        {mode === 'Definiteness' ? (
          <div className="rounded-md border border-cyan-200 bg-cyan-500/10 p-3 text-[10px] font-black uppercase tracking-widest text-cyan-100">Instruction: compare values, then swap if needed.</div>
        ) : null}
        {mode === 'Input' ? (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Data Entering</p>
            <div className="intro-viz-slide-in rounded-md border border-emerald-200 bg-emerald-500/20 p-2 text-[10px] font-black text-emerald-100">Input: 5, 2, 4</div>
          </div>
        ) : null}
        {mode === 'Output' ? (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">Result Leaving</p>
            <div className="intro-viz-slide-out rounded-md border border-violet-200 bg-violet-500/20 p-2 text-[10px] font-black text-violet-100">Output: 2, 4, 5</div>
          </div>
        ) : null}
        {mode === 'Uniqueness' ? (
          <div className="space-y-2 text-[10px] font-black uppercase tracking-widest">
            <div className="rounded-md border border-amber-200 bg-amber-500/20 p-2 text-amber-100">Step 1 Result</div>
            <div className="rounded-md border border-amber-200 bg-amber-500/20 p-2 text-amber-100">Step 2 uses Step 1</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function IntroductionVisualization({ activeSubtopicIndex = 0, selectedPill = '', subtopicTitle = 'Introduction' }) {
  const mode = selectedPill || '';

  return (
    <VizShell title={subtopicTitle}>
      {activeSubtopicIndex === 0 ? <SubtopicOne /> : null}
      {activeSubtopicIndex === 1 ? <SubtopicTwo selectedPill={mode} /> : null}
      {activeSubtopicIndex === 2 ? <SubtopicThree selectedPill={mode} /> : null}
      {activeSubtopicIndex === 3 ? <SubtopicFour selectedPill={mode} /> : null}
      {activeSubtopicIndex === 4 ? <SubtopicFive selectedPill={mode} /> : null}
      {activeSubtopicIndex === 5 ? <SubtopicSix selectedPill={mode} /> : null}
      {activeSubtopicIndex === 6 ? <SubtopicSeven selectedPill={mode} /> : null}
      {activeSubtopicIndex === 7 ? <SubtopicEight selectedPill={mode} /> : null}

      <style>{`
        @keyframes introVizGather {
          0% { transform: translate(var(--sx), var(--sy)); opacity: 0.55; }
          55% { opacity: 1; }
          100% { transform: translate(0, 0); opacity: 1; }
        }
        @keyframes introVizSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes introVizPulse {
          0%,100% { box-shadow: 0 0 0 rgba(56,189,248,0.0); }
          50% { box-shadow: 0 0 18px rgba(56,189,248,0.45); }
        }
        @keyframes introVizExit {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(34px); opacity: 0.2; }
        }
        @keyframes introVizEnter {
          0% { transform: translateX(-22px); opacity: 0; }
          100% { transform: translateX(116px); opacity: 1; }
        }
        @keyframes introVizPipelineDot {
          0% { left: 6px; opacity: 0.4; }
          20%,80% { opacity: 1; }
          100% { left: calc(100% - 22px); opacity: 0.4; }
        }
        @keyframes introVizStep1 { 0%,100%{opacity:.5;} 33%{opacity:1;} }
        @keyframes introVizStep2 { 0%,100%{opacity:.5;} 50%{opacity:1;} }
        @keyframes introVizStep3 { 0%,100%{opacity:.5;} 66%{opacity:1;} }
        @keyframes introVizProgress {
          0% { width: 6%; }
          100% { width: 78%; }
        }
        @keyframes introVizSlideIn {
          0% { transform: translateX(-12px); opacity: 0.45; }
          100% { transform: translateX(10px); opacity: 1; }
        }
        @keyframes introVizSlideOut {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(14px); opacity: 0.85; }
        }
        .intro-viz-gather { animation: introVizGather 2.1s ease-in-out infinite alternate; }
        .intro-viz-spin { animation: introVizSpin 4.8s linear infinite; }
        .intro-viz-pulse { animation: introVizPulse 1.6s ease-in-out infinite; }
        .intro-viz-exit { animation: introVizExit 1.4s ease-in-out infinite alternate; }
        .intro-viz-enter { animation: introVizEnter 1.7s ease-in-out infinite alternate; }
        .intro-viz-pipeline-dot { animation: introVizPipelineDot 2.2s linear infinite; }
        .intro-viz-step-1 { animation: introVizStep1 2.1s ease-in-out infinite; }
        .intro-viz-step-2 { animation: introVizStep2 2.1s ease-in-out infinite; }
        .intro-viz-step-3 { animation: introVizStep3 2.1s ease-in-out infinite; }
        .intro-viz-progress { animation: introVizProgress 2.2s ease-in-out infinite alternate; }
        .intro-viz-slide-in { animation: introVizSlideIn 1.7s ease-in-out infinite alternate; }
        .intro-viz-slide-out { animation: introVizSlideOut 1.7s ease-in-out infinite alternate; }
      `}</style>
    </VizShell>
  );
}
