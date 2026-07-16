import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, sublabel, accent = 'signal' }) {
  const accentMap = {
    signal: 'text-signal',
    emerald: 'text-emerald',
    amber: 'text-amber',
    rose: 'text-rose',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card p-5"
    >
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className={`font-display text-3xl font-semibold mt-1 ${accentMap[accent]}`}>{value}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </motion.div>
  );
}
