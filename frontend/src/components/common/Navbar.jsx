import Container from "./Container";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import {
  logout as clearSession,
  isAuthenticated as hasSession,
} from "../../utils/auth";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <nav
      className="
        border-b border-white/5
        bg-black/80
        backdrop-blur-lg
        sticky
        top-0
        z-50
      "
    >
      <Container>
        <div className="h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 rounded-lg text-left outline-none focus-v,isible:ring-2 focus-visible:ring-[#e7380d]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#e7380d] to-[#c66b3b] text-[#f8f6f3] shadow-sm">
              <span className="font-black text-2xl tracking-tighter">D</span>
            </span>
            <span className="text-xl font-black tracking-tight text-[#f8f6f3]">
              Dev<span className="text-[#edc390]">Sphere</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            {!hasSession() && (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#8d807c] transition-all hover:bg-white/[0.06] hover:text-[#f8f6f3]"
                >
                  Login
                </button>

                <Button
                  onClick={() => navigate("/register")}
                  size="sm"
                >
                  Get Started
                </Button>
              </>
            )}

            {hasSession() && (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#8d807c] transition-all hover:bg-white/[0.06] hover:text-[#f8f6f3]"
                >
                  Dashboard
                </button>

                <Button
                  onClick={handleLogout}
                  size="sm"
                  variant="danger"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
}

export default Navbar;
