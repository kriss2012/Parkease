import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-24 text-center">
        <p className="font-display text-6xl font-semibold text-signal">404</p>
        <p className="text-slate-500 mt-3 mb-6">This page doesn't exist, or the boom gate is down.</p>
        <Link to="/" className="btn-primary inline-block">Back to ParkEase</Link>
      </div>
    </div>
  );
}
