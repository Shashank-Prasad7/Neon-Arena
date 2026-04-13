import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const { user, openAuthModal } = useAuth();

  return (
    <section className="relative min-h-[760px] flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(72,151,255,0.18),transparent_26%),radial-gradient(circle_at_78%_22%,rgba(24,202,144,0.16),transparent_22%),radial-gradient(circle_at_50%_75%,rgba(114,220,255,0.08),transparent_35%)] pointer-events-none" />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 72% 62% at 50% 42%, rgba(7,18,38,0.08) 0%, rgba(14,14,15,0.48) 58%, rgba(14,14,15,0.95) 100%),
            linear-gradient(to bottom, rgba(8,12,24,0.42) 0%, rgba(8,12,24,0.18) 30%, rgba(14,14,15,0.88) 100%)
          `,
        }}
      />
      <div className="absolute left-[10%] top-[18%] h-28 w-28 rounded-full border border-primary/20 bg-primary/8 blur-2xl pointer-events-none" />
      <div className="absolute right-[12%] bottom-[22%] h-36 w-36 rounded-full border border-secondary/20 bg-secondary/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,12,22,0.72),rgba(8,12,22,0.38))] px-6 py-10 md:px-12 md:py-14 backdrop-blur-2xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-background/40 border border-secondary/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-[10px] font-black uppercase tracking-[0.25em]">Live Data · Season 2025/26</span>
          </div>

          <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-end">
            <div className="text-center md:text-left">
              <h1 className="text-6xl md:text-8xl font-headline font-black italic tracking-[-0.08em] leading-[0.92] mb-6 drop-shadow-[0_0_40px_rgba(114,220,255,0.22)]">
                SIGNALS.
                <br />
                SCANS.
                <br />
                <span className="text-primary">MATCHDAY.</span>
              </h1>

              <p className="text-base md:text-xl font-body text-on-surface-variant max-w-2xl mb-10 leading-relaxed uppercase tracking-[0.22em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                Track elite football through live intelligence, tactical shapes, and player scouting wrapped in a cinematic control room.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/matches"
                  className="px-10 py-4 bg-primary text-on-primary-container font-headline font-black uppercase tracking-[0.14em] rounded-2xl transition-all hover:shadow-[0_0_35px_rgba(114,220,255,0.5)] hover:scale-[1.02] active:scale-95"
                >
                  Open Match Center
                </Link>
                {!user && (
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-10 py-4 border border-secondary/60 text-secondary font-headline font-black uppercase tracking-[0.14em] rounded-2xl backdrop-blur-sm bg-background/20 transition-all hover:bg-secondary/15 hover:border-secondary hover:shadow-[0_0_25px_rgba(47,248,1,0.22)] active:scale-95"
                  >
                    Start Scouting
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.6rem] border border-primary/20 bg-black/25 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary mb-2">Realtime Stack</div>
                <div className="text-3xl font-headline font-black italic text-white">Live Scores</div>
                <p className="mt-2 text-sm text-zinc-400">Jump from fixtures into simulation, tactics, and squad context without leaving the flow.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Scouting</div>
                  <div className="mt-3 text-2xl font-headline font-black italic text-white">Players</div>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Systems</div>
                  <div className="mt-3 text-2xl font-headline font-black italic text-white">Tactics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-10">
        <span className="text-[10px] uppercase tracking-[0.3em] font-label">Scroll to Enter</span>
        <span className="material-symbols-outlined animate-bounce">expand_more</span>
      </div>
    </section>
  );
}
