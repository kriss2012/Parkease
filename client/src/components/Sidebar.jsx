import React from 'react';
import { NavLink } from 'react-router-dom';

// links: [{ to, label, icon (optional) }]
export default function Sidebar({ links, title }) {
  return (
    <aside className="w-60 shrink-0 hidden md:block">
      <div className="sticky top-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">{title}</p>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-signal/10 text-signal' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
