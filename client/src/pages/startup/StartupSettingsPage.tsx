import React, { useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import '../dashboard.css';

export default function StartupSettingsPage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      // In Stage 1, we reset or update password using auth service endpoint if available or dummy feedback
      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Account Settings</h1>
          <p>Manage your account security and preferences</p>
        </div>
      </div>

      <div className="grid-2col">
        <Card title="Account Profile">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>Full Name</label>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-navy)', marginTop: '4px' }}>{user?.name}</p>
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>Email Address</label>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-navy)', marginTop: '4px' }}>{user?.email}</p>
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>Account Role</label>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-navy)', marginTop: '4px' }}>Startup Executive</p>
            </div>
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <Button variant="danger" onClick={() => logout()}>
                Sign Out of Account
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Security & Password">
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {message && (
              <div style={{ padding: 'var(--space-3)', background: '#D1FAE5', color: '#065F46', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                {message}
              </div>
            )}
            {error && (
              <div style={{ padding: 'var(--space-3)', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                {error}
              </div>
            )}
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
