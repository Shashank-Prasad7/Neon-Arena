import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import AuthModal from './components/ui/AuthModal';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Home from './pages/Home';
import MatchCenter from './pages/MatchCenter';
import PlayerDiscovery from './pages/PlayerDiscovery';
import PlayerDetails from './pages/PlayerDetails';
import WorldCupHub from './pages/WorldCupHub';
import WorldCupMatchCenter from './pages/WorldCupMatchCenter';
import WorldCupSimulation from './pages/WorldCupSimulation';
import TacticalHub from './pages/TacticalHub';
import TournamentCenter from './pages/TournamentCenter';
import DemoWave from './pages/DemoWave';
import DemoMatrix from './pages/DemoMatrix';
import FootballCursorEffect from './components/ui/FootballCursorEffect';
import AIChatbot from './components/ui/AIChatbot';
import CelestialMatrixShader from './components/ui/martrix-shader';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <CelestialMatrixShader />
          </ErrorBoundary>
          <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(14,56,130,0.26),rgba(14,14,15,0.9)_34%,rgba(14,14,15,1)_75%)] pointer-events-none" />
          {/* Cursor effect in its own boundary — if it crashes it won't take down the whole app */}
          <ErrorBoundary>
            <FootballCursorEffect />
          </ErrorBoundary>

          <div className="relative z-10 flex flex-col min-h-dvh bg-transparent text-on-background">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/matches" element={<MatchCenter />} />
                <Route path="/players" element={<PlayerDiscovery />} />
                <Route path="/players/:id" element={<PlayerDetails />} />
                <Route path="/worldcup" element={<WorldCupHub />} />
                <Route path="/worldcup/matches" element={<WorldCupMatchCenter />} />
                <Route path="/simulation" element={<WorldCupSimulation />} />
                <Route path="/tactics" element={<TacticalHub />} />
                <Route path="/tournaments" element={<TournamentCenter />} />
                <Route path="/demo" element={<DemoWave />} />
                <Route path="/demo-matrix" element={<DemoMatrix />} />
              </Routes>
            </main>
            <div className="h-24 md:h-0" />
            <BottomNav />
            <AuthModal />
            {/* Chatbot in its own boundary */}
            <ErrorBoundary>
              <AIChatbot />
            </ErrorBoundary>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
