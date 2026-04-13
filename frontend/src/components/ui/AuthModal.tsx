import { useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative glass-card border border-outline-variant/30 rounded-2xl p-8 w-full max-w-md animate-slide-up">
        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-black italic uppercase tracking-tighter text-primary text-glow-primary">
            {authModalMode === 'login' ? 'Sign In' : 'Join the Arena'}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {authModalMode === 'login'
              ? 'Access live scores and player stats.'
              : 'Create your free scout account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full bg-surface-container-highest border border-outline-variant/50 focus:border-primary rounded-lg px-4 py-3 text-sm outline-none transition-colors text-white placeholder:text-on-surface-variant"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="scout@neonarena.com"
              className="w-full bg-surface-container-highest border border-outline-variant/50 focus:border-primary rounded-lg px-4 py-3 text-sm outline-none transition-colors text-white placeholder:text-on-surface-variant"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="w-full bg-surface-container-highest border border-outline-variant/50 focus:border-primary rounded-lg px-4 py-3 text-sm outline-none transition-colors text-white placeholder:text-on-surface-variant"
            />
          </div>

          {error && (
            <p className="text-error text-sm bg-error-container/20 border border-error/30 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary-container font-headline font-black uppercase tracking-tighter py-4 rounded-xl hover:shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : authModalMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          {authModalMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => openAuthModal(authModalMode === 'login' ? 'register' : 'login')}
            className="text-primary hover:underline font-bold"
          >
            {authModalMode === 'login' ? 'Join Now' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
