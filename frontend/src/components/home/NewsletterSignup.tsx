import { useState } from 'react';
import type { FormEvent } from 'react';
import * as api from '../../services/api';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await api.subscribeNewsletter(email);
      setStatus('success');
      setMessage(res.data.message);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto glass-card rounded-2xl p-12 text-center relative z-10 border border-white/5">
        <h2 className="text-4xl font-headline font-black uppercase italic mb-4">Join the Inner Circle</h2>
        <p className="text-on-surface-variant mb-10 max-w-xl mx-auto font-body">
          Get exclusive scouting reports, real-time match alerts, and high-definition highlights delivered to your inbox.
        </p>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-5xl text-secondary">check_circle</span>
            <p className="text-secondary font-bold uppercase tracking-widest">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ENTER YOUR EMAIL"
              className="flex-1 bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary focus:outline-none transition-all text-sm font-label uppercase tracking-widest px-6 py-4 rounded-lg text-white placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-primary text-on-primary-container px-8 py-4 font-headline font-bold uppercase tracking-tighter rounded-lg hover:shadow-[0_0_20px_rgba(114,220,255,0.4)] transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-4 text-error text-sm">{message}</p>
        )}
      </div>
    </section>
  );
}
