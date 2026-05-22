import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LinkedListQuestV2 from './LinkedListQuestV2/LinkedListQuestV2';
import nodeBly from '../assets/img/node_bly.png';
import nodeLocked from '../assets/img/node_locked.png';
import frameFullWidth from '../assets/img/frame-full-width.png';
import HyperSpaceHorizontal from '../components/HyperSpaceHorizontal';

// Nodes (extended)
const LESSON_NODES = [
  {
    id: 'linked-list-quest',
    title: 'Linked List Quest',
    subtitle: 'Lesson 01',
    description: 'Build the foundation with nodes, pointers, and traversal.',
    x: '8%',
    y: '50%',
    locked: false,
  },
  {
    id: 'lesson-2',
    title: 'Pointer Shift',
    subtitle: 'Lesson 02',
    description: 'Learn how pointer updates reshape the chain.',
    x: '18%',
    y: '50%',
    locked: false,
  },
  {
    id: 'lesson-3',
    title: 'Search Walkthrough',
    subtitle: 'Lesson 03',
    description: 'Walk the list and stop when you find the target value.',
    x: '28%',
    y: '50%',
    locked: false,
  },
  { id: 'lesson-4', title: 'Insert Node', subtitle: 'Lesson 04', description: 'Test how a node gets inserted between two existing nodes.', x: '38%', y: '50%', locked: true },
  { id: 'lesson-5', title: 'Delete Node', subtitle: 'Lesson 05', description: 'Remove a node and reconnect the chain behind it.', x: '48%', y: '50%', locked: true },
  { id: 'lesson-6', title: 'Tail Runner', subtitle: 'Lesson 06', description: 'Track the tail as the list grows to the right.', x: '58%', y: '50%', locked: true },
  { id: 'lesson-7', title: 'Loop Check', subtitle: 'Lesson 07', description: 'Spot circular references before they break traversal.', x: '68%', y: '50%', locked: true },
  { id: 'lesson-8', title: 'Lesson 08', subtitle: 'Future Module', x: '78%', y: '50%', locked: true },
  { id: 'lesson-9', title: 'Lesson 09', subtitle: 'Future Module', x: '88%', y: '50%', locked: true },
  { id: 'lesson-10', title: 'Lesson 10', subtitle: 'Future Module', x: '98%', y: '50%', locked: true },
  { id: 'lesson-11', title: 'Lesson 11', subtitle: 'Future Module', x: '108%', y: '50%', locked: true },
];

export default function NodeMapOverlay() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPlayingLesson, setIsPlayingLesson] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  // Change this value (pixels) to move all nodes up/down together.
  // Positive moves nodes down, negative moves nodes up.
  const NODE_VERTICAL_OFFSET = 24;

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setIsEntering(false), 20);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isPlayingLesson) {
          setIsPlayingLesson(false);
          return;
        }
        if (selectedNode) {
          setSelectedNode(null);
          return;
        }
        navigate('/playershipdashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(enterTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlayingLesson, selectedNode, navigate]);

  const handleWheel = (event) => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      scrollElement.scrollLeft += event.deltaY;
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden bg-black text-slate-900 transition-opacity duration-300 ${isEntering ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0">
        <HyperSpaceHorizontal />
      </div>

      <img
        src={frameFullWidth}
        alt="Lesson node frame"
        className="pointer-events-none absolute inset-0 h-full w-full object-fill opacity-100"
      />

      <style>{`
        .node-map-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .node-map-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className={`relative z-10 h-screen w-screen flex items-center justify-center transition-all duration-300 ${isEntering ? 'translate-y-2 scale-[0.985] opacity-80' : 'translate-y-0 scale-100 opacity-100'}`}>
        <div className="relative flex w-[95%] h-[90%] flex-col overflow-hidden rounded-[1.6rem] bg-transparent px-8 py-8 sm:px-10 sm:py-10">
          <button
            type="button"
            onClick={() => (isPlayingLesson ? setIsPlayingLesson(false) : selectedNode ? setSelectedNode(null) : navigate('/playershipdashboard'))}
            className="absolute right-0 top-0 z-20 rounded-full border border-white/20 bg-black/70 px-4 py-2 font-vcr text-[10px] uppercase tracking-[0.28em] text-white transition hover:bg-black"
          >
            {isPlayingLesson || selectedNode ? 'Back' : 'Close'}
          </button>

          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-vcr text-[10px] uppercase tracking-[0.32em] text-[#165A9E]">Lesson Node Map</p>
              <h2 className="mt-1 font-aribold text-2xl uppercase tracking-[0.18em] text-slate-900 sm:text-3xl">
                {selectedNode ? selectedNode.title : 'Choose a lesson'}
              </h2>
              <p className="mt-2 max-w-xl font-vcr text-[10px] uppercase tracking-[0.22em] text-slate-500">
                {selectedNode ? selectedNode.description : 'Click an active node to preview its lesson details.'}
              </p>
            </div>
            <p className="max-w-xs text-right font-vcr text-[10px] uppercase tracking-[0.24em] text-slate-500">
              {isPlayingLesson ? 'Playing Lesson' : selectedNode ? 'Ready to play' : 'Click a node'}
            </p>
          </div>

          {isPlayingLesson && selectedNode ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.3rem] border border-slate-300 bg-[#f7f4ef]/95 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-300/80 px-4 py-3 sm:px-5">
                <div>
                  <p className="font-vcr text-[10px] uppercase tracking-[0.32em] text-[#165A9E]">Active Lesson</p>
                  <h3 className="mt-1 font-aribold text-2xl uppercase tracking-[0.18em] text-slate-900 sm:text-3xl">
                    {selectedNode.title}
                  </h3>
                </div>
                <div className="text-right font-vcr text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  {selectedNode.subtitle}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-3">
                <div className="h-full overflow-auto rounded-[1rem] border border-slate-300 bg-white shadow-inner">
                  <LinkedListQuestV2 />
                </div>
              </div>
            </div>
          ) : (
            // Map view: straight line, horizontal scrolling nodes, corner texts, Play button when a node is selected
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.3rem] border border-slate-300 bg-black/40 shadow-inner backdrop-blur-sm flex flex-col">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
                {/* Adjust this line's y value to move all nodes up or down together; adjust strokeWidth to change the line thickness. */}
                <line x1="0" y1="200" x2="1200" y2="200" stroke="#165A9E" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
              </svg>

              <div
                ref={scrollRef}
                onWheel={handleWheel}
                className="node-map-scrollbar-hide relative z-10 flex-1 overflow-x-auto overflow-y-hidden"
              >
                <div className="flex min-w-max h-full items-start px-12 pt-10 pb-12 sm:px-16 sm:pt-12">
                  {/* Nodes container: use NODE_VERTICAL_OFFSET above to move them vertically */}
                  <div
                    className="inline-flex min-w-max items-center gap-40 px-20 sm:gap-52 sm:px-32"
                    style={{ transform: `translateY(${NODE_VERTICAL_OFFSET}px)` }}
                  >
                    {LESSON_NODES.map((node) => {
                    const isPrimary = node.id === 'linked-list-quest';
                    const isLocked = node.locked;
                    const isSelected = selectedNode?.id === node.id;

                    return isLocked ? (
                      <div key={node.id} className="group flex-shrink-0 flex flex-col items-center cursor-not-allowed">
                        <div className="relative flex flex-col items-center pt-8 sm:pt-10">
                          <span className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500 opacity-10 blur-xl" />
                          <img src={nodeLocked} alt="Locked Node" className="relative z-10 h-24 w-24 object-contain opacity-75 sm:h-28 sm:w-28" />
                        </div>
                        <span className="mt-4 text-center font-vcr text-[10px] uppercase tracking-[0.24em] text-white/60 w-24">{node.subtitle}</span>
                      </div>
                    ) : (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNode(node)}
                        className={`group flex-shrink-0 flex flex-col items-center outline-none transition-transform duration-200 hover:scale-110 ${isSelected ? 'scale-110' : ''}`}
                        aria-label={`Select ${node.title}`}
                      >
                        <div className="relative flex flex-col items-center pt-8 sm:pt-10">
                          <span className={`pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5a72a] opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-35 ${isSelected ? 'opacity-30' : ''}`} />
                          <img src={nodeBly} alt="Node" className={`relative z-10 h-24 w-24 object-contain drop-shadow-[0_0_18px_rgba(255,144,0,0.24)] sm:h-28 sm:w-28 ${isPrimary ? 'scale-110' : ''}`} />
                        </div>
                        <span className="mt-4 text-center font-vcr text-[10px] uppercase tracking-[0.24em] text-white/80 w-28">{node.subtitle}</span>
                      </button>
                    );
                    })}
                  </div>
                </div>
              </div>

              {/* corner texts preserved */}
              <div className="absolute bottom-4 left-4 w-[19rem] rounded-2xl border border-white/10 bg-black/25 px-5 py-4 backdrop-blur-md sm:bottom-6 sm:left-6 sm:w-[22rem] sm:px-6 sm:py-5">
                <h3 className="font-vcr text-[12px] uppercase tracking-[0.3em] text-white">
                  {selectedNode ? selectedNode.subtitle : 'Placeholder info'}
                </h3>
                <div className="mt-3 space-y-2 font-vcr text-[11px] leading-6 text-slate-200/80 sm:text-[12px]">
                  {selectedNode ? (
                    <>
                      <p>{selectedNode.description}</p>
                      <p>Selected: {selectedNode.title}</p>
                    </>
                  ) : (
                    <>
                      <p>player stats on this</p>
                      <p>player stats on this</p>
                      <p>player stats on this</p>
                      <p>player stats on this</p>
                      <p>player stats on this</p>
                    </>
                  )}
                </div>
              </div>

              <div className="absolute bottom-4 right-4 w-[20rem] rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-right backdrop-blur-md sm:bottom-6 sm:right-6 sm:w-[24rem] sm:px-6 sm:py-5">
                <h3 className="font-vcr text-[12px] uppercase tracking-[0.3em] text-white">{selectedNode ? selectedNode.title : 'Title'}</h3>
                <div className="mt-3 space-y-2 font-vcr text-[11px] leading-6 text-slate-200/80 sm:text-[12px]">
                  {selectedNode ? (
                    <>
                      <p>{selectedNode.description}</p>
                      <p>Press Play to start this lesson.</p>
                      <p>Current node: {selectedNode.subtitle}</p>
                    </>
                  ) : (
                    <>
                      <p>Information about the thing goes here</p>
                      <p>Information about the thing goes here</p>
                      <p>Information about the thing goes here</p>
                      <p>Information about the thing goes here</p>
                    </>
                  )}
                </div>
              </div>

              {/* Play button shown when a node is selected (no info card) */}
              {selectedNode && (
                <div className="absolute inset-x-0 bottom-8 flex justify-center z-30">
                  <button
                    type="button"
                    onClick={() => setIsPlayingLesson(true)}
                    className="rounded-full bg-[#f5a72a] px-6 py-3 font-vcr text-[12px] uppercase tracking-[0.28em] text-black font-bold shadow-lg hover:bg-[#e89a1a]"
                  >
                    Play
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
