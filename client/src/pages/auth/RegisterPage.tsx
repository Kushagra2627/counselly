import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import './auth.css';

type Role = 'STARTUP' | 'LAWYER';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role')?.toUpperCase() as Role) || 'STARTUP';

  const [role, setRole] = useState<Role>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, role);
      // Redirect to onboarding based on role
      navigate(role === 'STARTUP' ? '/onboarding/startup' : '/onboarding/lawyer');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-logo">
          <Link to="/" className="auth-wordmark">Counselly</Link>
        </div>
        <h1 className="auth-title">Create your account</h1>

        {/* Role selector — no ADMIN option */}
        <div className="auth-role-selector">
          <button
            type="button"
            className={`role-tab ${role === 'STARTUP' ? 'role-tab--active' : ''}`}
            onClick={() => setRole('STARTUP')}
          >
            I'm a Startup
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'LAWYER' ? 'role-tab--active' : ''}`}
            onClick={() => setRole('LAWYER')}
          >
            I'm a Lawyer
          </button>
        </div>

        <p className="auth-subtitle">
          {role === 'STARTUP'
            ? 'Find verified legal counsel for your business.'
            : 'Connect with startups that need your expertise.'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-field">
            <label htmlFor="name">{role === 'STARTUP' ? 'Your name' : 'Full name'}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              required
              autoComplete="name"
              disabled={isLoading}
            />
          </div>

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
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-terms">
          By creating an account you agree to our{' '}
          <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
