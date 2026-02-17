import React, { useState } from 'react';
import { User } from '../types';
import { API_BASE } from '../lib/api';
import { ArrowRight, LogIn, Sun } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User & { token?: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password || !inviteCode.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password, inviteCode: inviteCode.trim() }),
      });
      if (res.status === 404) {
        setError('Backend not running. Use: npm run dev:all');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Sign up failed');
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      if (res.status === 404) {
        setError('Backend not running. Use: npm run dev:all');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Sign in failed');
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = mode === 'signup' ? handleSignUp : handleSignIn;

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-b from-indigo-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-200">
            <Sun size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lanzarote 2027</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'signup' ? 'Create an account to join' : 'Sign in to continue'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-slate-50"
                placeholder="e.g. Niff"
                required
                minLength={2}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-slate-50"
                placeholder="6+ characters"
                required
                minLength={6}
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Group code</label>
                <input
                  type="password"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-slate-50"
                  placeholder="Ask the group admin"
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px] shadow-sm shadow-indigo-200"
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Sign in'}{' '}
              {mode === 'signin' ? <LogIn size={16} /> : <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-primary font-semibold hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-primary font-semibold hover:underline">
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
