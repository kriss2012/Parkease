import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-16">
        <h1 className="text-2xl font-semibold mb-1">Reset your password</h1>
        <p className="text-slate-500 text-sm mb-8">We'll email you a link to set a new one.</p>

        {sent ? (
          <div className="card p-6 text-sm text-slate-600">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={submit} className="card p-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
