import { useState, useEffect, useRef } from 'react';
import * as api from '../../services/api';

interface Stat { value: number; suffix: string; label: string; display: string }

const DEFAULT_STATS: Stat[] = [
  { value: 24, suffix: '', label: 'Live Matches Now', display: '24' },
  { value: 142, suffix: '', label: 'Active Countries', display: '142' },
  { value: 8200, suffix: 'K', label: 'Top Scorers Tracked', display: '8.2K' },
];

function useCountUp(target: number, duration = 1500, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, 1500, active);
  const display = stat.suffix === 'K' ? (count / 1000).toFixed(1) + 'K' : String(count);
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <span className="text-5xl md:text-7xl font-headline font-black text-primary drop-shadow-[0_0_10px_rgba(0,210,255,0.3)]">
        {display}
      </span>
      <span className="text-secondary font-label uppercase tracking-widest text-sm font-bold">{stat.label}</span>
    </div>
  );
}

export default function StatsCounter() {
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getStats().then((res) => {
      const d = res.data;
      setStats([
        { value: d.liveMatches, suffix: '', label: 'Live Matches Now', display: String(d.liveMatches) },
        { value: d.activeCountries, suffix: '', label: 'Active Countries', display: String(d.activeCountries) },
        { value: d.topScorers, suffix: 'K', label: 'Top Scorers Tracked', display: (d.topScorers / 1000).toFixed(1) + 'K' },
      ]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {stats.map((stat) => <StatItem key={stat.label} stat={stat} active={active} />)}
      </div>
    </section>
  );
}
