import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { clearDemoAuthSession } from '../../demoAuth';

const tabs = [
  { label: 'Dashboard', to: '/instructor', base: 'bg-[#4d8ecb]', active: 'bg-[#4d8ecb]' },
  { label: 'Learning Materials', to: '/instructor/learning-materials', base: 'bg-[#9bb8d8]', active: 'bg-[#9bb8d8]' },
  { label: 'Activity Management', to: '/instructor/activity-management', base: 'bg-[#ff9800]', active: 'bg-[#ff9800]' },
];

const frameThemes = {
  dashboard: {
    border: '#4d8ecb',
    tint: 'rgba(77, 142, 203, 0.08)',
    shadow: 'rgba(22, 90, 158, 0.18)',
  },
  learning: {
    border: '#9bb8d8',
    tint: 'rgba(155, 184, 216, 0.12)',
    shadow: 'rgba(88, 112, 146, 0.16)',
  },
  activity: {
    border: '#ff9800',
    tint: 'rgba(255, 152, 0, 0.10)',
    shadow: 'rgba(170, 104, 0, 0.20)',
  },
};

function getFrameTheme(pathname) {
  if (pathname.startsWith('/instructor/activity-management')) {
    return frameThemes.activity;
  }

  if (pathname.startsWith('/instructor/learning-materials')) {
    return frameThemes.learning;
  }

  return frameThemes.dashboard;
}

function TabLink({ tab }) {
  return (
    <NavLink
      to={tab.to}
      end={tab.to === '/instructor'}
      className={({ isActive }) =>
        [
          'relative inline-flex h-12 items-center justify-center rounded-t-[12px] px-6 text-sm sm:text-[15px] font-medium tracking-[0.18em] text-white whitespace-nowrap transition-colors duration-200',
          tab.label === 'Activity Management' ? 'min-w-[220px]' : tab.label === 'Learning Materials' ? 'min-w-[205px]' : 'min-w-[150px]',
          isActive
            ? `${tab.active} z-20 text-white`
            : `${tab.base} z-10 brightness-[0.97] hover:brightness-100`,
        ].join(' ')
      }
    >
      {tab.label}
    </NavLink>
  );
}

export default function InstructorLayout() {
  const location = useLocation();
  const frameTheme = getFrameTheme(location.pathname);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearDemoAuthSession();
      window.location.assign('/');
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f7ff_0%,#d7e8fb_100%)] text-slate-800">
      <div className="flex min-h-screen w-full flex-col">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3 px-1 sm:px-2">
          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="flex flex-wrap items-end gap-0 overflow-hidden rounded-t-[14px]">
              {tabs.map((tab) => (
                <TabLink key={tab.label} tab={tab} />
              ))}
            </div>
            <div className="hidden h-10 w-px bg-slate-300/90 sm:block" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Instructor Panel</p>
              <h1 className="text-2xl font-bold text-[#0f2f57] sm:text-3xl">Balangkas</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-slate-700"
            >
              Log Out
            </button>
            <div className="rounded-2xl bg-white px-4 py-2 shadow-[0_8px_24px_rgba(22,90,158,0.14)] ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-800">John Doe</p>
              <p className="text-xs text-slate-500">Instructor</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-2 shadow-[0_8px_24px_rgba(22,90,158,0.14)] ring-1 ring-slate-200">
              <p className="text-xl font-black tracking-[0.18em] text-slate-900">BALANGKAS</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Instructor&apos;s Domain</p>
            </div>
          </div>
        </div>

        <main
          className="flex-1 rounded-[1.4rem] border-[10px] bg-white/75 backdrop-blur-sm sm:rounded-[1.7rem] sm:border-[12px]"
          style={{
            borderColor: frameTheme.border,
            boxShadow: `0 22px 60px ${frameTheme.shadow}`,
            backgroundColor: frameTheme.tint,
          }}
        >
          <div className="h-full min-h-[calc(100vh-7rem)] w-full rounded-[1rem] bg-white shadow-inner sm:rounded-[1.25rem]">
            <div className="h-2 w-full rounded-t-[1.25rem]" style={{ backgroundColor: frameTheme.border }} />
            <div className="border-t border-slate-200/70 px-0 py-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
