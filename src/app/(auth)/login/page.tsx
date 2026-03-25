'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

// Helper component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Check for success message from registration
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('Account created successfully! Please sign in.');
    }
    // Check for auth errors
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email or password.');
    } else if (errorParam) {
      setError('An error occurred during sign in.');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        throw new Error('Invalid email or password');
      }

      if (res?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="page-title">Welcome Back</h1>
        <p className="page-subtitle">Sign in to your account</p>
      </div>

      {successMsg && (
        <div style={{ padding: 'var(--space-md)', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div style={{ padding: 'var(--space-md)', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid" style={{ gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="form-group">
          <div className="flex-between">
            <label className="form-label" htmlFor="password">Password</label>
            <Link href="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: 'var(--space-sm)' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Demo Credentials Alert */}
      <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)' }}>
        <p style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Demo Credentials:</p>
        <ul style={{ color: 'var(--color-text-secondary)', listStyleType: 'disc', paddingLeft: 'var(--space-md)' }}>
          <li>Admin: admin@quickbite.com / admin123</li>
          <li>Customer: john@example.com / customer123</li>
          <li>Driver: driver@quickbite.com / driver123</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

// Ensure the page component is completely client-side.
// We wrap LoginForm in Suspense because it uses useSearchParams
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: 'var(--space-2xl)' }}>
      <Suspense fallback={<div className="card skeleton" style={{ height: '400px' }}></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
