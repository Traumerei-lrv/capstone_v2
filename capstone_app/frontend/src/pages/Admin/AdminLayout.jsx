import { useLocation, NavLink, Outlet } from "react-router-dom";
import { clearDemoAuthSession } from "../../demoAuth";
import { supabase } from "../../supabase";

const tabs = [
  { label: "Users", to: "/admin", base: "bg-[#8b5cf6]", active: "bg-[#8b5cf6]" },
  { label: "Courses", to: "/admin/courses", base: "bg-[#0f766e]", active: "bg-[#0f766e]" },
  { label: "Monitoring", to: "/admin/monitoring", base: "bg-[#4d8ecb]", active: "bg-[#4d8ecb]" },
  { label: "Content", to: "/admin/content", base: "bg-[#ff9800]", active: "bg-[#ff9800]" },
  { label: "Backup", to: "/admin/backup", base: "bg-[#334155]", active: "bg-[#334155]" },
  { label: "Security", to: "/admin/security", base: "bg-[#dc2626]", active: "bg-[#dc2626]" },
];

const frameThemes = {
  users: { border: "#8b5cf6", tint: "rgba(139, 92, 246, 0.08)", shadow: "rgba(103, 49, 166, 0.16)" },
  courses: { border: "#0f766e", tint: "rgba(15, 118, 110, 0.08)", shadow: "rgba(13, 92, 86, 0.16)" },
  monitoring: { border: "#4d8ecb", tint: "rgba(77, 142, 203, 0.08)", shadow: "rgba(22, 90, 158, 0.18)" },
  content: { border: "#ff9800", tint: "rgba(255, 152, 0, 0.10)", shadow: "rgba(170, 104, 0, 0.18)" },
  backup: { border: "#334155", tint: "rgba(51, 65, 85, 0.08)", shadow: "rgba(15, 23, 42, 0.16)" },
  security: { border: "#dc2626", tint: "rgba(220, 38, 38, 0.08)", shadow: "rgba(153, 27, 27, 0.16)" },
};

function getFrameTheme(pathname) {
  if (pathname.startsWith("/admin/security")) return frameThemes.security;
  if (pathname.startsWith("/admin/backup")) return frameThemes.backup;
  if (pathname.startsWith("/admin/content")) return frameThemes.content;
  if (pathname.startsWith("/admin/monitoring")) return frameThemes.monitoring;
  if (pathname.startsWith("/admin/courses")) return frameThemes.courses;
  return frameThemes.users;
}

function TabLink({ tab }) {
  return (
    <NavLink
      to={tab.to}
      end={tab.to === "/admin"}
      className={({ isActive }) => [
        "relative inline-flex h-12 items-center justify-center rounded-t-[12px] px-5 text-sm sm:text-[15px] font-medium tracking-[0.18em] text-white whitespace-nowrap transition-colors duration-200",
        isActive ? `${tab.active} z-20` : `${tab.base} z-10 brightness-[0.97] hover:brightness-100`,
        tab.label === "Monitoring" ? "min-w-[170px]" : tab.label === "Security" ? "min-w-[160px]" : "min-w-[140px]",
      ].join(" ")}
    >
      {tab.label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const frameTheme = getFrameTheme(location.pathname);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearDemoAuthSession();
      window.location.assign("/");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f7ff_0%,#dbe6f8_100%)] text-slate-800">
      <div className="flex min-h-screen w-full flex-col px-2 py-2 sm:px-3 sm:py-3">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="flex flex-wrap items-end gap-0 overflow-hidden rounded-t-[14px]">
              {tabs.map((tab) => (
                <TabLink key={tab.label} tab={tab} />
              ))}
            </div>
            <div className="hidden h-10 w-px bg-slate-300/90 sm:block" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin Panel</p>
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
              <p className="text-sm font-semibold text-slate-800">Administrator</p>
              <p className="text-xs text-slate-500">Platform Control</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-2 shadow-[0_8px_24px_rgba(22,90,158,0.14)] ring-1 ring-slate-200">
              <p className="text-xl font-black tracking-[0.18em] text-slate-900">BALANGKAS</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Admin&apos;s Domain</p>
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
