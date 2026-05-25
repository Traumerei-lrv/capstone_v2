import { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { fetchUnreadMessageCountForCurrentUser, subscribeToMessages } from '../../api/messages';

const tabs = [
  { label: 'Home', to: '/instructor', end: true },
  { label: 'Class Management', to: '/instructor/class-management', end: false },
  { label: 'Messages', to: '/instructor/messages', end: false },
];

function TabLink({ tab, unreadCount }) {
  return (
    <NavLink
      to={tab.to}
      end={tab.end}
      className={({ isActive }) => `relative pb-1 text-sm font-semibold uppercase tracking-wider transition-colors ${
        isActive ? 'text-white font-bold border-b-2 border-white' : 'text-blue-100 font-medium hover:text-white'
      }`}
    >
      {tab.label}
      {tab.label === 'Messages' && unreadCount > 0 ? (
        <span className="absolute -right-4 -top-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-white">
          {unreadCount}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function InstructorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadUnread = async () => {
      try {
        const count = await fetchUnreadMessageCountForCurrentUser('instructor');
        if (active) {
          setUnreadCount(Number(count || 0));
        }
      } catch {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    loadUnread();
    const unsub = subscribeToMessages(loadUnread);
    const intervalId = window.setInterval(loadUnread, 15000);

    return () => {
      active = false;
      unsub();
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-slate-900">
      <header className="bg-[#5089c6] border-b-2 border-blue-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <nav className="hidden md:flex items-center gap-6">
              {tabs.map((tab) => (
                <TabLink key={tab.label} tab={tab} unreadCount={unreadCount} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-white">
            <button className="p-2 hover:bg-blue-600 rounded-full transition-colors relative" type="button" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 border-2 border-blue-700 rounded-full"></span>
            </button>
            <button
              className={`p-1 rounded-full transition-colors ${location.pathname === '/instructor/profile' ? 'bg-blue-700 ring-2 ring-white/70' : 'hover:bg-blue-600'}`}
              type="button"
              aria-label="Instructor profile"
              onClick={() => navigate('/instructor/profile')}
            >
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-blue-100">
                <User className="text-blue-600 w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
