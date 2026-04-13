const NEWS_ITEMS = [
  'Mbappé confirmed fit for Tuesday clash',
  'City to reveal new titanium-weave kit tomorrow',
  'VAR rule update: Clearer interpretation on natural silhouette',
  'Transfer window opens in 3 days — sources confirm mega deal brewing',
  'Champions League draw results: Group stage fixtures released',
  'Injury update: Bellingham returns to training',
  'New stadium capacity record broken at Wembley',
  'Youth academy breakthrough: 17-year-old scores debut hat-trick',
  'Managerial sackings: Two Premier League bosses dismissed over the weekend',
  'La Liga title race tightens as Barcelona drop points away from home',
  'Serie A: Juventus win classic 4-3 thriller in Turin',
  'UEFA announces new financial fair play regulations starting next season',
  'World Cup 2026: FIFA inspects final stadium venues across host nations',
  'Record-breaking transfer fee rejected by Borussia Dortmund for star midfielder',
  'Exclusive interview: The tactical mind behind Atalanta’s incredible season',
  'Derby Day Drama: Three red cards issued in fiery clash at San Siro',
  'Weather warning: Multiple fixtures postponed due to heavy snowfall',
  'Adidas hints at new boot technology designed specifically for synthetic pitches',
];

export default function NewsTicker() {
  const text = NEWS_ITEMS.join('  ·  ');

  return (
    <div className="w-full bg-surface-container-low border-y border-outline-variant/20 py-2 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-none flex items-center gap-2 px-4 border-r border-outline-variant/30 mr-4">
          <span className="material-symbols-outlined text-secondary text-sm">sensors</span>
          <span className="text-secondary text-[10px] font-black uppercase tracking-widest">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap">
            <span className="text-on-surface-variant text-xs font-body">{text}  ·  {text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
