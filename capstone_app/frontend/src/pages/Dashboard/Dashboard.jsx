import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { clearDemoAuthSession } from '../../demoAuth';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const footerRef = useRef(null);

  useEffect(() => {
    // Header entrance animation
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    // Cards stagger animation
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out',
      }
    );

    // Footer animation
    gsap.fromTo(
      footerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' }
    );
  }, []);

  const handleCardHover = (index, isEnter) => {
    gsap.to(cardsRef.current[index], {
      scale: isEnter ? 1.05 : 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleLogout = () => {
    clearDemoAuthSession();
    navigate('/', { replace: true });
  };

  return (
    <div className="bg-sky-50 overflow-x-hidden min-h-screen">
      <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
        {/* Header */}
        <header ref={headerRef} className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="flex flex-col gap-1.5 mr-5">
              <div className="h-2 w-12 bg-[#165A9E] rounded-full"></div>
              <div className="h-2 w-14 bg-[#F39200] rounded-full translate-x-2"></div>
              <div className="h-2 w-12 bg-[#165A9E] rounded-full"></div>
            </div>
            <h1 className="text-5xl font-black text-[#165A9E] tracking-tighter">
              BALANGKAS
            </h1>
          </div>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            Welcome back, Explorer. Select your next DSA milestone and begin the conquest.
          </p>
        </header>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* Easy Card */}
          <Link
            ref={(el) => (cardsRef.current[0] = el)}
            to="/route/easy"
            onMouseEnter={() => handleCardHover(0, true)}
            onMouseLeave={() => handleCardHover(0, false)}
            className="group relative flex flex-col bg-white/70 backdrop-blur-xl border border-emerald-100 rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:-translate-y-3 cursor-pointer"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-emerald-500 opacity-[0.03] group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-8 text-white shadow-xl shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-emerald-700">Array Sentinel</h2>
            <p className="text-slate-600 leading-relaxed mb-10 flex-grow">
              Master the fundamentals of linear data structures. Practice Arrays, Linked Lists, and Big O analysis.
            </p>
            <div className="flex items-center text-sm font-bold uppercase tracking-widest text-emerald-600/60 group-hover:text-emerald-600 transition-colors">
              Initiate Deployment
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
          </Link>

          {/* Medium Card */}
          <Link
            ref={(el) => (cardsRef.current[1] = el)}
            to="/route/medium"
            onMouseEnter={() => handleCardHover(1, true)}
            onMouseLeave={() => handleCardHover(1, false)}
            className="group relative flex flex-col bg-white/70 backdrop-blur-xl border border-blue-100 rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(22,90,158,0.15)] hover:-translate-y-3 cursor-pointer"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#165A9E] opacity-[0.03] group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-[#165A9E] flex items-center justify-center mb-8 text-white shadow-xl shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#165A9E]">BST Navigator</h2>
            <p className="text-slate-600 leading-relaxed mb-10 flex-grow">
              Explore the branching paths of Hierarchy. Tackle Binary Search Trees, Heaps, and Sorting.
            </p>
            <div className="flex items-center text-sm font-bold uppercase tracking-widest text-[#165A9E]/60 group-hover:text-[#165A9E] transition-colors">
              Initiate Deployment
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
          </Link>

          {/* Hard Card */}
          <Link
            ref={(el) => (cardsRef.current[2] = el)}
            to="/route/hard"
            onMouseEnter={() => handleCardHover(2, true)}
            onMouseLeave={() => handleCardHover(2, false)}
            className="group relative flex flex-col bg-white/70 backdrop-blur-xl border border-orange-100 rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(243,146,0,0.15)] hover:-translate-y-3 cursor-pointer"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#F39200] opacity-[0.03] group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-[#F39200] flex items-center justify-center mb-8 text-white shadow-xl shadow-orange-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 3.333 3 5 1.237 2.062.312 4.963-1.5 6.5a4.5 4.5 0 0 1-7 0Z"/>
                <path d="M5 22c.345-2.658 2.06-4.719 4-6"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#F39200]">Graph Architect</h2>
            <p className="text-slate-600 leading-relaxed mb-10 flex-grow">
              The peak of algorithms. Conquer Dynamic Programming, complex Graph theory, and Hard challenges.
            </p>
            <div className="flex items-center text-sm font-bold uppercase tracking-widest text-[#F39200]/60 group-hover:text-[#F39200] transition-colors">
              Initiate Deployment
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* Simple Footer */}
        <footer ref={footerRef} className="mt-20 py-8 text-slate-400 text-sm font-medium border-t border-slate-200/50 w-full text-center">
          &copy; 2026 BALANGKAS • GAMIFY LEARNING ENVIRONMENT
          <br />
          <button onClick={handleLogout} className="mt-4 text-red-500 hover:text-red-700 font-bold">
            Log Out
          </button>
        </footer>
      </div>
    </div>
  );
}
