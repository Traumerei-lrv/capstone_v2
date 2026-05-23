import { Bell, Layout, User } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const tabs = [
  { label: "User Management", to: "/admin", end: true },
  { label: "Class Management", to: "/admin/classes", end: false },
  { label: "System Monitoring", to: "/admin/monitoring", end: false },
  { label: "Content Management", to: "/admin/content", end: false },
];

function TabLink({ tab }) {
  return (
    <NavLink
      to={tab.to}
      end={tab.end}
      className={({ isActive }) =>
        `pb-1 text-sm uppercase tracking-wide transition-colors ${
          isActive ? "text-white font-bold border-b-2 border-white" : "text-blue-100 font-medium hover:text-white"
        }`
      }
    >
      {tab.label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-slate-900">
      <header className="sticky top-0 z-50 border-b-2 border-blue-700 bg-[#5089c6]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <button type="button" onClick={() => navigate('/admin')} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
                <Layout className="h-5 w-5 text-[#5089c6]" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-white">BALANGKAS</span>
            </button>
            <nav className="hidden items-center gap-6 md:flex">
              {tabs.map((tab) => (
                <TabLink key={tab.label} tab={tab} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-white">
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">Signed in as</p>
              <p className="text-sm font-bold">{user?.profile?.full_name || "Administrator"}</p>
            </div>
            <button className="relative rounded-full p-2 transition-colors hover:bg-blue-600" type="button" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-blue-700 bg-orange-500"></span>
            </button>
            <button
              className={`rounded-full p-1 transition-colors ${location.pathname === "/admin/profile" ? "bg-blue-700 ring-2 ring-white/70" : "hover:bg-blue-600"}`}
              type="button"
              aria-label="Administrator profile"
              onClick={() => navigate('/admin/profile')}
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Admin Dashboard</p>
          <h1 className="mt-1 text-2xl font-black text-blue-900">Platform Administration</h1>
          <p className="mt-1 text-sm text-slate-500">
            {`Welcome, ${user?.profile?.full_name || "Administrator"}. Manage users, classes, system activity, and learning content in one control center.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {tabs.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                    isActive ? "border-blue-300 bg-blue-100 text-blue-800" : "border-slate-200 bg-slate-50 text-slate-700"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
