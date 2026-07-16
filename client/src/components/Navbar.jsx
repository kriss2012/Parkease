import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleHome = { admin: '/admin', owner: '/owner', guard: '/guard', user: '/dashboard' };

  return (
    <header className="sticky top-0 z-30 bg-ink-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg tracking-tight">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
          ParkEase
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link to={roleHome[user.role] || '/'} className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <span className="text-slate-500 hidden sm:inline">{user.name}</span>
              <button
                onClick={async () => { await logout(); navigate('/login'); }}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Log in</Link>
              <Link to="/register" className="bg-signal hover:bg-signal-dark px-3 py-1.5 rounded-lg transition-colors">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
