import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { startupService } from '../../services/startup.service';
import type { StartupOverview, StartupProfile } from '../../services/startup.service';
import { legalRequestService } from '../../services/legalRequest.service';
import type { LegalRequest } from '../../services/legalRequest.service';
import '../dashboard.css';

export default function StartupOverviewPage() {
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [overview, setOverview] = useState<StartupOverview | null>(null);
  const [recentRequests, setRecentRequests] = useState<LegalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, ov, reqs] = await Promise.all([
          startupService.getProfile(),
          startupService.getOverview(),
          legalRequestService.getRequests(),
        ]);
        setProfile(prof);
        setOverview(ov);
        setRecentRequests(reqs.slice(0, 3));
      } catch { /* handle silently */ } finally { setIsLoading(false); }
    };
    load();
  }, []);

  if (isLoading) return <div className="dashboard-loading"><div className="dash-spinner" /></div>;

  const stats = [
    { label: 'Active Requests', value: overview?.activeRequests ?? 0 },
    { label: 'Draft Requests', value: overview?.draftRequests ?? 0 },
    { label: 'Total Matches', value: overview?.totalMatches ?? 0 },
    { label: 'Total Requests', value: overview?.totalRequests ?? 0 },
  ];

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const isSubmitted = profile?.verificationStatus === 'SUBMITTED';

  return (
    <div className="dashboard-page">
      {!isVerified && (
        <div style={{
          background: isSubmitted ? 'var(--color-warning-light)' : 'var(--color-ivory)',
          border: `1px solid ${isSubmitted ? 'var(--color-warning)' : 'var(--color-gray-light)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap'
        }}>
          <div>
            <strong style={{ display: 'block', color: 'var(--color-black)', fontSize: 'var(--text-sm)' }}>
              {isSubmitted ? 'Company Verification Under Review' : 'Company Verification Incomplete'}
            </strong>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-dark)' }}>
              {isSubmitted
                ? 'Your registration details have been submitted and are being reviewed by Counselly operations.'
                : 'Complete entity verification to access dedicated fractional general counsel retainers and agreements.'}
            </span>
          </div>
          <Link to="/startup/verification" className="btn-secondary" style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}>
            {isSubmitted ? 'View Verification Status' : 'Verify Entity →'}
          </Link>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Overview</h1>
          <p>Your legal operations at a glance.</p>
        </div>
        <Link to="/startup/requests/new" className="btn-primary">+ New Request</Link>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2>Recent Legal Requests</h2>
        <Link to="/startup/requests" className="view-all">View all →</Link>
      </div>

      {recentRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No legal requests yet</h3>
          <p>Create your first legal request to start finding matched counsel.</p>
          <Link to="/startup/requests/new" className="btn-primary">Create Request</Link>
        </div>
      ) : (
        <div className="requests-list">
          {recentRequests.map(req => (
            <Link key={req.id} to={`/startup/requests/${req.id}`} className="request-row">
              <div className="request-row-info">
                <span className="request-title">{req.title}</span>
                <span className="request-meta">{req.matterType} · {req.jurisdiction}</span>
              </div>
              <span className={`status-badge status-${req.status.toLowerCase()}`}>
                {req.status.replace(/_/g, ' ')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
