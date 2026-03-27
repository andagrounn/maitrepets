'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const d = await api.signup(form);
      setUser(d.user);
      router.push('/create');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <span>🐶</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Maîtrepets</span>
          </Link>
          <p className="text-gray-500 mt-2">Create your free account</p>
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Get Started Free</h1>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your name</label>
              <input className="input" type="text" placeholder="Jane Smith" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 8 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link href="/login" className="text-purple-600 hover:underline font-medium">Sign in</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-3">Free to generate. No credit card required.</p>
        </div>
      </div>
    </div>
  );
}
