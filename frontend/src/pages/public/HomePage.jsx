import Navbar from "../../components/common/Navbar";
import Container from "../../components/common/Container";
import Button from "../../components/ui/Button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const railWords = [
    "Projects",
    "Consistency",
    "Leaderboard",
    "Momentum",
    "Engineering Habits",
    "Velocity",
    "Command Center",
    "Analytics",
    "DevSphere",
    "Ambitious Builders",
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden bg-[#0a0a0a] text-[#f8f6f3]">
      <div>
        <Navbar />

        <main className="relative">
          <div className="absolute inset-0 surface-grid opacity-30" />

          <Container className="relative">
            <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center text-center py-16 lg:py-20">
              <section className="flex flex-col items-center animate-rise-in max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#edc390]/20 bg-[#edc390]/10 px-4 py-1.5 text-sm font-semibold text-[#edc390]">
                  <Sparkles size={16} />
                  Premium developer analytics
                </div>

                <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                  Track your{" "}
                  <span className="bg-gradient-to-r from-[#e7380d] via-[#edc390] to-[#c66b3b] bg-clip-text text-transparent">
                    developer growth
                  </span>
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#f8f6f3]/80 sm:text-xl font-medium">
                  DevSphere turns projects, consistency, leaderboard momentum, and
                  engineering habits into a polished command center for ambitious builders.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center w-full max-w-md">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/register")}
                    size="lg"
                  >
                    Start building
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/login")}
                    size="lg"
                    variant="secondary"
                  >
                    Sign in
                  </Button>
                </div>
              </section>
            </div>
          </Container>
        </main>
      </div>

      {/* Dynamic rail of words at the footer */}
      <footer className="relative w-full border-t border-white/5 py-8 overflow-hidden bg-black/50 backdrop-blur-sm mt-auto">
        {/* Fade gradient overlays on left and right ends for smooth fade in/out effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee items-center gap-12 select-none">
          {/* Duplicate the array twice to ensure seamless infinite looping */}
          {[...railWords, ...railWords].map((word, idx) => (
            <div key={idx} className="flex items-center gap-12">
              <span className="text-lg sm:text-xl font-bold tracking-wider text-[#8d807c]/60 hover:text-[#edc390] transition-colors duration-300 uppercase">
                {word}
              </span>
              <span className="text-[#e7380d]/40 font-bold">•</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
