import React, { useState } from 'react';
import { 
  Bell, 
  User, 
  Search, 
  ChevronRight, 
  Trophy, 
  Key,
  Users,
  Award,
  CheckCircle,
  Layout,
  Activity
} from 'lucide-react';

/**
 * BALANGKAS CLASS REGISTRY - REACT COMPONENT
 * 
 * This component implements the "Balangkas: Class Registry" page with 
 * the high-fidelity aesthetic requested. It matches the Student Dashboard
 * styling using Tailwind CSS and Lucide-React.
 */

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border-2 border-blue-100 p-6 ${className}`}>
    {children}
  </div>
);

/* Header removed — use parent page's navbar instead */

const ClassCard = ({ title, instructor, level, enrolled, total, image }) => (
  <Card className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer group">
    <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-xl">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
      />
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 bg-[#fdc500] text-blue-900 text-[10px] font-black uppercase tracking-widest rounded-md">
          LEVEL {level}
        </span>
      </div>
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-black text-blue-900 mb-1">{title}</h3>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4">Instructor: {instructor}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
          {enrolled}/{total} Enrolled
        </span>
        <button className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View Details <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </Card>
);

const FleetProgress = ({ label, percentage }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-black text-blue-100">{percentage}%</span>
    </div>
    <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-400 rounded-full" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const ClassRegistry = () => {
  const [classCode, setClassCode] = useState('');

  const availableClasses = [
    {
      title: "Advanced Propulsion Systems",
      instructor: "Cmdr. Elias Vance",
      level: 3,
      enrolled: 24,
      total: 30,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Lunar Base Engineering 101",
      instructor: "Sarah Lunaris",
      level: 1,
      enrolled: 12,
      total: 40,
      image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Quantum Signal Processing",
      instructor: "Dr. Aris Thorne",
      level: 4,
      enrolled: 28,
      total: 30,
      image: "https://images.unsplash.com/photo-1501862700950-18382cd41497?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Orbital Mechanics II",
      instructor: "Prof. K. Sato",
      level: 2,
      enrolled: 35,
      total: 50,
      image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-blue-900 tracking-tight mb-3">Mission Class Command</h1>
          <p className="text-slate-500 font-medium max-w-2xl">
            Enroll in advanced technical fleets and coordinate with instructors across the mission network.
          </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableClasses.map((cls, idx) => (
                <ClassCard key={idx} {...cls} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search for Class or Instructor"
                className="w-full bg-white border-2 border-blue-100 rounded-xl py-4 pl-12 pr-6 font-bold text-sm focus:outline-none focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>

            {/* Join via Class Code */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Key className="text-blue-600 w-5 h-5" />
                <h2 className="text-lg font-black text-blue-900 tracking-tight">Join via Class Code</h2>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-6">
                Enter the 6-digit alphanumeric code provided by your instructor.
              </p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="ABC-123"
                  className="flex-1 bg-blue-50 border-2 border-blue-100 rounded-xl px-4 py-3 font-mono font-bold text-center tracking-widest focus:outline-none focus:border-blue-300"
                  maxLength={7}
                />
                <button className="bg-blue-700 hover:bg-blue-800 active:scale-95 transition-all text-white font-black px-6 py-3 rounded-xl uppercase tracking-widest text-xs shadow-md">
                  Join
                </button>
              </div>
            </Card>

            {/* Active Fleets */}
            <div className="bg-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-700/20 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-tight">Active Fleets</h2>
              </div>
              <div className="space-y-6">
                <FleetProgress label="Deep Space Logistics" percentage={75} />
                <FleetProgress label="Exo-Biology Core" percentage={42} />
                <FleetProgress label="Cyber-Defense Ops" percentage={90} />
              </div>
              <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-xs font-black uppercase tracking-widest border border-white/20">
                Manage Fleets
              </button>
            </div>

            {/* Fleet Bonus */}
            <div className="bg-[#fdc500] rounded-2xl p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="text-blue-900 w-6 h-6" />
                  <h2 className="text-xl font-black text-blue-900 tracking-tight">Fleet Bonus</h2>
                </div>
                <p className="text-sm font-bold text-blue-900/80 mb-6 leading-relaxed">
                  Join any public fleet this week to receive a <span className="text-blue-900">2.5x XP Multiplier</span> on all technical challenges and unlock exclusive mission gear!
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-blue-900 text-xs font-bold">
                    <CheckCircle className="w-4 h-4" /> Priority Access to Labs
                  </li>
                  <li className="flex items-center gap-2 text-blue-900 text-xs font-bold">
                    <CheckCircle className="w-4 h-4" /> Mentor Guided Sessions
                  </li>
                </ul>
                <button className="w-full py-4 bg-blue-900 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Claim Perks
                </button>
              </div>
              {/* Decorative dots background pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="grid grid-cols-6 gap-4 p-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-blue-900 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
      </main>
  );
};

export default ClassRegistry;