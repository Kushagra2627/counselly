import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import './auth.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }
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
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Reset link is invalid or has expired. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <Link to="/" className="auth-wordmark">Counselly</Link>
          </div>
          <div className="auth-success-icon">✓</div>
          <h1 className="auth-title">Password updated</h1>
          <p className="auth-subtitle">
            Your password has been reset successfully. Redirecting to sign in…
          </p>
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
        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">Choose a strong password for your account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-field">
            <label htmlFor="password">New password</label>
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
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading || !token}>
            {isLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>

        <Link to="/login" className="auth-back-link">← Back to sign in</Link>
      </div>
    </div>
  );
}
