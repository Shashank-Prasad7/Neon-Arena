import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../../services/api';
import type { FormationData, Player, WorldCupData } from '../../types';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

type ScoutKnowledge = {
  players: Player[];
  formations: FormationData[];
  worldCup: WorldCupData | null;
};

function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function buildFeatureReply(input: string) {
  if (input.includes('home')) return 'The home page highlights Match of the Night, live cards, featured players, and quick navigation into matches, tactics, and player scouting.';
  if (input.includes('tactic') || input.includes('formation')) return 'The tactics section shows club and country setups, formations, managers, starters, and substitutes. Clicking a country or team opens its tactical board.';
  if (input.includes('world cup')) return 'The World Cup area is now separate from the club match center. It focuses on countries, live and upcoming national-team fixtures, standings, and country tactics.';
  if (input.includes('register')) return 'You can register a new player from the player discovery page. That player is added to the database, appears in the scouting list, and can feed into club and country depth.';
  if (input.includes('match center')) return 'The club Match Center handles league and club fixtures, while the World Cup Match Center is countries-only. Upcoming matches no longer fake post-match style projections.';
  if (input.includes('player')) return 'Player profiles include ratings, form, career highlights, market value, media cards, and a richer hero area at the top.';
  return '';
}

function findFeaturedMatch(input: string, knowledge: ScoutKnowledge) {
  return knowledge.worldCup?.featuredMatches.find((match) => input.includes(normalize(match.homeTeam.name)) || input.includes(normalize(match.awayTeam.name)));
}

function findUpcomingFixture(input: string, knowledge: ScoutKnowledge) {
  return knowledge.worldCup?.fixtures.find((fixture) => input.includes(normalize(fixture.homeTeam)) || input.includes(normalize(fixture.awayTeam)));
}

function buildScoutReply(rawInput: string, knowledge: ScoutKnowledge) {
  const input = normalize(rawInput);
  if (!input) return 'Ask me about a player, club, country, match page, tactics, or a site feature and I will keep it simple.';
  if (/\b(hi|hello|hey)\b/.test(input)) return 'Hi! Ask me about any player, club, country, or feature in the site.';
  if (input.includes('how are you')) return "I'm ready to help. What do you want to know about the site or the football data?";

  const featureReply = buildFeatureReply(input);
  if (featureReply) return featureReply;

  const player = knowledge.players.find((entry) => {
    const full = normalize(entry.name);
    const short = normalize(entry.shortName);
    return input.includes(full) || input.includes(short);
  });

  if (player) {
    return `${player.name} is a ${player.rating}-rated ${player.position.toLowerCase()} for ${player.club} and ${player.nationality}. This season they have ${player.seasonStats.goals} goals and ${player.seasonStats.assists} assists in ${player.seasonStats.matches} matches.`;
  }

  const club = knowledge.formations.find((entry) => input.includes(normalize(entry.club)));
  if (club) {
    return `${club.club} usually line up in ${club.formation} under ${club.manager}. You can open the tactics page to view the starting shape and substitutes for that team.`;
  }

  const countryPlayers = knowledge.players.filter((playerEntry) => input.includes(normalize(playerEntry.nationality)));
  if (countryPlayers.length > 0) {
    const country = countryPlayers[0].nationality;
    const topNames = countryPlayers.slice(0, 3).map((entry) => entry.name).join(', ');
    return `${country} are represented in the database with players like ${topNames}. Open the country tactics page to see the national setup, manager context, and squad depth.`;
  }

  const worldCupMatch = findFeaturedMatch(input, knowledge);
  if (worldCupMatch) {
    if (input.includes('score') || input.includes('result') || input.includes('winning')) {
      return `Right now ${worldCupMatch.homeTeam.name} vs ${worldCupMatch.awayTeam.name} is ${worldCupMatch.homeScore}-${worldCupMatch.awayScore} at ${worldCupMatch.minute}'.`;
    }
    return `${worldCupMatch.homeTeam.name} vs ${worldCupMatch.awayTeam.name} is currently shown in the World Cup live feed at ${worldCupMatch.minute}'. The score there is ${worldCupMatch.homeScore}-${worldCupMatch.awayScore}.`;
  }

  const upcomingFixture = findUpcomingFixture(input, knowledge);
  if (upcomingFixture) {
    if (input.includes('future') || input.includes('predict') || input.includes('analysis') || input.includes('who will win') || input.includes('next')) {
      return `${upcomingFixture.homeTeam} vs ${upcomingFixture.awayTeam} is still upcoming. My pre-match read is that the game should hinge on midfield control, transitions, and which side creates the cleaner first big chance. You can open the World Cup Match Center or the simulation feed for a fuller preview.`;
    }
    return `${upcomingFixture.homeTeam} vs ${upcomingFixture.awayTeam} is an upcoming World Cup fixture scheduled for ${upcomingFixture.date} at ${upcomingFixture.time} in ${upcomingFixture.venue}.`;
  }

  if (input.includes('live') || input.includes('upcoming') || input.includes('finished')) {
    return 'Live, upcoming, and finished matches are split across the club Match Center and the dedicated World Cup Match Center. Team names there also link into tactics pages.';
  }

  if (input.includes('future') || input.includes('predict') || input.includes('analysis')) {
    return 'For future matches I can give you a pre-match analysis based on the teams involved, tactical shape, likely game flow, and where the key moments may come from.';
  }

  return 'I can help with site features, players, clubs, countries, tactics, World Cup pages, and match center behavior. Try a name like "France", "Real Madrid", "Rafael Thorne", or ask about a page like "tactics section".';
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your Neon Arena AI Scout. Ask me about players, clubs, countries, tactics, the World Cup area, or any page in the site.", sender: 'ai' }
  ]);
  const [knowledge, setKnowledge] = useState<ScoutKnowledge>({ players: [], formations: [], worldCup: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    Promise.allSettled([api.getPlayers(), api.getFormations(), api.getWorldCup()]).then(([players, formations, worldCup]) => {
      setKnowledge({
        players: players.status === 'fulfilled' ? players.value.data?.players ?? [] : [],
        formations: formations.status === 'fulfilled' ? formations.value.data?.data ?? [] : [],
        worldCup: worldCup.status === 'fulfilled' ? worldCup.value.data ?? null : null,
      });
    });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const responseText = buildScoutReply(userMsg.text, knowledge);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: responseText, sender: 'ai' }]);
    }, 250);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary-container rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:scale-110 transition-transform z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-surface-container-high border border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 glass-card"
          >
            <div className="px-4 py-3 bg-surface-container-highest border-b border-outline-variant/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">smart_toy</span>
                <span className="font-headline font-black italic tracking-widest text-sm uppercase">AI Scout</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-xl px-4 py-2 text-sm font-body ${msg.sender === 'user' ? 'bg-primary text-on-primary-container rounded-br-none' : 'bg-surface-container-lowest text-white border border-outline-variant/20 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-outline-variant/30 bg-surface-container flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about players, teams, countries, or features..."
                className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-full px-4 text-sm font-body text-white outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-full bg-primary/20 text-primary flex justify-center items-center hover:bg-primary hover:text-on-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
