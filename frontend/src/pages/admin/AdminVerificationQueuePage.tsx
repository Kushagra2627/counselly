import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { verificationService } from '../../services/verification.service';
import type { VerificationSubmissionRecord } from '../../services/verification.service';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import './admin.css';

export default function AdminVerificationQueuePage() {
  const [submissions, setSubmissions] = useState<VerificationSubmissionRecord[]>([]);
  const [filter, setFilter] = useState<'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'ALL'>('SUBMITTED');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSubmissions = async (status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'ALL') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await verificationService.adminListVerifications(status);
      setSubmissions(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load verification queue. Ensure you are signed in with an ADMIN account.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(filter);
  }, [filter]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Verification Queue</h1>
          <p>Review and verify lawyer bar credentials and startup business registrations</p>
        </div>
        <Button variant="secondary" onClick={() => loadSubmissions(filter)}>
          Refresh Queue
        </Button>
      </div>

      <div className="status-filter-bar">
        <button
          className={`status-filter-btn ${filter === 'SUBMITTED' ? 'active' : ''}`}
          onClick={() => setFilter('SUBMITTED')}
        >
          Pending Review
        </button>
        <button
          className={`status-filter-btn ${filter === 'VERIFIED' ? 'active' : ''}`}
          onClick={() => setFilter('VERIFIED')}
        >
          Verified
        </button>
        <button
          className={`status-filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setFilter('REJECTED')}
        >
          Rejected
        </button>
        <button
          className={`status-filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-error)', marginBottom: 'var(--space-4)' }}>
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <LoadingState message="Loading verification queue..." />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon="shield"
          title="No verification submissions found"
          description={`There are currently no verification records with status "${filter}".`}
        />
      ) : (
        <div className="admin-queue-list">
          {submissions.map((sub) => {
            const isLawyer = sub.entityType === 'LAWYER';
            const title = isLawyer
              ? `${sub.barNumber || 'Bar Registration'} — ${sub.licensingBody || 'Bar Council'}`
              : `${sub.companyLegalName || 'Company Entity'} (${sub.businessRegistrationNumber || 'Reg No.'})`;

            return (
              <div key={sub.id} className="admin-queue-item">
                <div className="admin-queue-info">
                  <div className="admin-queue-header">
                    <span className={`admin-entity-badge ${isLawyer ? 'admin-entity-badge--lawyer' : 'admin-entity-badge--startup'}`}>
                      {sub.entityType}
                    </span>
                    <span className="admin-queue-title">{title}</span>
                  </div>
                  <div className="admin-queue-meta">
                    Submitted on {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {sub.professionalEmail && ` • Email: ${sub.professionalEmail}`}
                    {sub.authorizedRepresentative && ` • Rep: ${sub.authorizedRepresentative}`}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Badge variant={sub.status === 'VERIFIED' ? 'success' : sub.status === 'REJECTED' ? 'error' : 'warning'}>
                    {sub.status}
                  </Badge>
                  <Link to={`/admin/verification/${sub.id}`}>
                    <Button variant="secondary" size="sm">
                      Review Submission
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
