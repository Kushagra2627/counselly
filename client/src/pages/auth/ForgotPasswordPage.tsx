import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch {
      // Always show success message to prevent email enumeration
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <Link to="/" className="auth-wordmark">Counselly</Link>
          </div>
          <div className="auth-success-icon">✓</div>
          <h1 className="auth-title">Check your inbox</h1>
          <p className="auth-subtitle">
            If an account exists for <strong>{email}</strong>, a password reset
            link has been sent. Check your email to continue.
          </p>
          <Link to="/login" className="auth-back-link">← Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/" className="auth-wordmark">Counselly</Link>
        </div>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

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

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/login" className="auth-back-link">← Back to sign in</Link>
      </div>
    </div>
  );
}
