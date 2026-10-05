import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import './auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      const redirect = searchParams.get('redirect') || null;
      if (redirect) {
        navigate(redirect);
      } else if (loggedInUser.role === 'STARTUP') {
        const onboardingDone = loggedInUser.startup?.onboardingDone ?? false;
        navigate(onboardingDone ? '/startup/overview' : '/onboarding/startup');
      } else if (loggedInUser.role === 'LAWYER') {
        const onboardingDone = loggedInUser.lawyer?.onboardingDone ?? false;
        navigate(onboardingDone ? '/lawyer/overview' : '/onboarding/lawyer');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/" className="auth-wordmark">Counselly</Link>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Get started</Link>
        </p>
      </div>
    </div>
  );
}
