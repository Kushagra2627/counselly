import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lawyerService } from '../../services/lawyer.service';
import type { LawyerProfile } from '../../services/lawyer.service';
import { matchService } from '../../services/match.service';
import type { Match } from '../../services/match.service';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { Icon } from '../../components/ui/Icon';
import '../dashboard.css';

export default function LawyerOverviewPage() {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      lawyerService.getProfile(),
      matchService.getMatchesForLawyer(),
    ])
      .then(([profData, matchesData]) => {
        setProfile(profData);
        setMatches(matchesData || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState message="Loading lawyer dashboard..." />;

  const pendingMatches = matches?.filter((m) => m.status === 'PENDING') || [];
  const activeEngagements = matches?.filter((m) => m.status === 'ENGAGED' || m.status === 'ACCEPTED') || [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Welcome, {profile?.user?.name || 'Counsel'}</h1>
          <p>Fractional General Counsel Dashboard • {profile?.title || 'Corporate Attorney'}</p>
        </div>
        <Link to="/lawyer/requests">
          <Button variant="primary">Browse Open Startup Requests</Button>
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="briefcase" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activeEngagements.length}</span>
            <span className="stat-label">Active Engagements</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="sparkles" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{pendingMatches.length}</span>
            <span className="stat-label">Pending Client Matches</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="clock" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{profile?.monthlyCapacity || 0} hrs</span>
            <span className="stat-label">Monthly Retainer Capacity</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="shield" />
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ fontSize: 'var(--text-lg)' }}>
              {profile?.verificationStatus === 'VERIFIED' ? 'VERIFIED' : profile?.verificationStatus || 'PENDING'}
            </span>
            <span className="stat-label">Bar Verification Status</span>
          </div>
        </div>
      </div>

      <div className="grid-2col">
        <Card
          title="Recent Client Matches"
          headerAction={
            <Link to="/lawyer/matches" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy)', fontWeight: 600 }}>
              View All Matches
            </Link>
          }
        >
          {matches?.length === 0 ? (
            <p style={{ color: 'var(--color-slate-500)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '24px 0' }}>
              No client matches yet. You will be automatically matched when startups post requests matching your practice area and jurisdiction!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {matches?.slice(0, 5).map((match) => (
                <div
                  key={match.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    background: 'var(--color-ivory)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-navy)' }}>
                        {match.legalRequest?.title || 'Legal Request'}
                      </strong>
                      <span className="match-score-badge">High Fit</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-600)', marginTop: '4px' }}>
                      {match.startup?.companyName || 'Startup Client'} • {match.legalRequest?.industry || 'General'} • {formatCurrency(match.legalRequest?.budgetMax, match.legalRequest?.currency)}/mo
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <StatusBadge status={match.status} type="match" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card title="Bar Verification">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-600)' }}>
                Verification guarantees trust to startups looking for verified fractional general counsel.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span className="verified-badge">
                  <Icon name="checkCircle" /> {profile?.verificationStatus || 'PENDING'}
                </span>
                <Link to="/lawyer/verification">
                  <Button variant="ghost">Manage Bar Credentials</Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Profile & Capacity">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                  Bar Jurisdictions
                </span>
                <div className="tag-cloud" style={{ marginTop: '4px' }}>
                  {profile?.jurisdictions.map((j) => (
                    <Badge key={j} variant="gold">{j}</Badge>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                  Practice Areas
                </span>
                <div className="tag-cloud" style={{ marginTop: '4px' }}>
                  {profile?.practiceAreas.map((pa) => (
                    <Badge key={pa} variant="primary">{pa}</Badge>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <Link to="/lawyer/profile">
                  <Button variant="secondary" fullWidth>
                    Edit Counsel Profile & Rates
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
