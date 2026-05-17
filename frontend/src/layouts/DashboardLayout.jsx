import {
  Code2,
  Flame,
  GitBranch,
  Menu,
  Settings,
  Sparkles,
  Trophy,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardLayout({ children, currentView = "overview", onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "skills", icon: Sparkles, label: "Skills" },
    { id: "projects", icon: Code2, label: "Projects" },
    { id: "github", icon: GitBranch, label: "GitHub" },
    { id: "activity", icon: Flame, label: "Activity" },
    { id: "leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  return (
    <div className="min-h-screen bg-black text-[#f8f6f3]">
      <div className="fixed inset-0 -z-10 surface-grid opacity-30" />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <button
            className="flex items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#e7380d]"
            onClick={() => { onNavigate?.("overview"); navigate("/dashboard"); }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#e7380d] to-[#c66b3b] text-[#f8f6f3] shadow-sm">
              <span className="font-black text-xl tracking-tighter">D</span>
            </span>
            <span className="font-black tracking-tight text-[#f8f6f3]">
              Dev<span className="text-[#edc390]">Sphere</span>
            </span>
          </button>

          <button
            aria-label="Open navigation"
            className="rounded-lg border border-white/5 bg-white/[0.06] p-2 text-[#f8f6f3]"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {isOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5
          bg-[#080808]/95 p-4 backdrop-blur-2xl transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#e7380d]"
            onClick={() => { onNavigate?.("overview"); navigate("/dashboard"); }}
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#e7380d] to-[#c66b3b] text-[#f8f6f3] shadow-sm">
              <span className="font-black text-2xl tracking-tighter">D</span>
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight text-[#f8f6f3]">
                Dev<span className="text-[#edc390]">Sphere</span>
              </span>
            </span>
          </button>

          <button
            aria-label="Close navigation"
            className="rounded-lg p-2 text-[#8d807c] hover:bg-white/[0.07] lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`
                group flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all w-full text-left outline-none
                ${currentView === item.id
                  ? "bg-[#e7380d]/10 text-[#f8f6f3] border-l-2 border-[#e7380d]"
                  : "text-[#8d807c] hover:bg-white/[0.06] hover:text-[#f8f6f3]"}
              `}
              onClick={() => {
                onNavigate?.(item.id);
                setIsOpen(false);
              }}
            >
              <item.icon
                className={`transition-colors ${currentView === item.id ? "text-[#e7380d]" : "group-hover:text-[#edc390]"}`}
                size={18}
              />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5">
          <a
            href="https://www.linkedin.com/in/ayushsingh1406/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8d807c]/50 hover:text-[#edc390] transition-colors cursor-pointer"
          >
            Made by Ayush K. Singh
          </a>
        </div>
      </aside>

      <main className="lg:pl-72">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
