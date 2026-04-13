import HeroSection from '../components/home/HeroSection';
import StatsCounter from '../components/home/StatsCounter';
import LiveMatchPanel from '../components/home/LiveMatchPanel';
import FeaturedPlayers from '../components/home/FeaturedPlayers';
import NewsletterSignup from '../components/home/NewsletterSignup';

export default function Home() {
  return (
    <div className="pb-8 relative">
      <div className="pointer-events-none absolute inset-x-0 top-[20rem] h-64 bg-[radial-gradient(circle_at_center,rgba(114,220,255,0.08),transparent_68%)]" />
      <HeroSection />
      <StatsCounter />
      <LiveMatchPanel />
      <FeaturedPlayers />
      <NewsletterSignup />
    </div>
  );
}
