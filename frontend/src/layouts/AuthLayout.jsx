import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

function AuthLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="absolute inset-0 surface-grid opacity-60" />
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />

      {/* Global Home Button - Top Left of viewport */}
      <div className="absolute left-8 top-8 z-50">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#8d807c] hover:text-[#edc390] transition-colors text-[10px] font-black uppercase tracking-[0.2em] group"
        >
          <Home size={14} />
          <span className="opacity-60 group-hover:opacity-100 transition-opacity">Back to Portal</span>
        </button>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
