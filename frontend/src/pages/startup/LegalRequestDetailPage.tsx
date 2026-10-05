import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { legalRequestService } from '../../services/legalRequest.service';
import type { LegalRequest } from '../../services/legalRequest.service';
import { matchService } from '../../services/match.service';
import type { Match } from '../../services/match.service';
import { REQUEST_STATUS_LABELS, URGENCY_LABELS } from '../../config/constants';
import { formatRetainerRange, formatDate } from '../../utils/formatters';

export default function LegalRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<LegalRequest | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [req, matchData] = await Promise.all([
          legalRequestService.getRequest(id),
          matchService.getMatchesForRequest(id).catch(() => []),
        ]);
        setRequest(req);
        setMatches(matchData);
      } catch { navigate('/startup/requests'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!id || !request) return;
    setIsSubmitting(true);
    try {
      const updated = await legalRequestService.submitRequest(id);
      setRequest(updated);
      const matchData = await matchService.getMatchesForRequest(id).catch(() => []);
      setMatches(matchData);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Submission failed.');
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="dashboard-loading"><div className="dash-spinner" /></div>;
  if (!request) return null;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <Link to="/startup/requests" className="back-link">← Legal Requests</Link>
          <h1>{request.title}</h1>
        </div>
        <div className="header-actions">
          <span className={`status-badge status-${request.status.toLowerCase()}`}>
            {REQUEST_STATUS_LABELS[request.status] || request.status}
          </span>
          {request.status === 'DRAFT' && (
            <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Request'}
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Request details */}
        <div className="detail-card">
          <h3>Request Details</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>Matter Type</span><strong>{request.matterType}</strong></div>
            <div className="detail-row"><span>Industry</span><strong>{request.industry || '—'}</strong></div>
            <div className="detail-row"><span>Jurisdiction</span><strong>{request.jurisdiction}</strong></div>
            <div className="detail-row"><span>Budget</span><strong>{request.currency} {request.budgetMin.toLocaleString()}–{request.budgetMax.toLocaleString()} / month</strong></div>
            <div className="detail-row"><span>Expected Hours</span><strong>{request.expectedHours} hrs / month</strong></div>
            <div className="detail-row"><span>Urgency</span><strong>{URGENCY_LABELS[request.urgency] || request.urgency}</strong></div>
            <div className="detail-row"><span>Availability</span><strong>{request.availability}</strong></div>
            <div className="detail-row"><span>Created</span><strong>{formatDate(request.createdAt)}</strong></div>
            {request.submittedAt && (
              <div className="detail-row"><span>Submitted</span><strong>{formatDate(request.submittedAt)}</strong></div>
            )}
          </div>
          {request.description && (
            <div className="detail-desc">
              <h4>Description</h4>
              <p>{request.description}</p>
            </div>
          )}
          {request.requiredExpertise.length > 0 && (
            <div className="detail-chips">
              <h4>Required Expertise</h4>
              <div className="chip-row">
                {request.requiredExpertise.map(e => <span key={e} className="chip-display">{e}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Matches */}
        <div className="detail-matches">
          <h3>Matched Counsel {matches.length > 0 && <span className="match-count">{matches.length}</span>}</h3>
          {matches.length === 0 ? (
            <div className="empty-state empty-state--sm">
              <p>
                {request.status === 'DRAFT'
                  ? 'Submit this request to find matched counsel.'
                  : 'Matching is in progress. Check back shortly.'}
              </p>
            </div>
          ) : (
            <div className="match-cards">
              {matches.map(match => (
                <div key={match.id} className="match-card">
                  <div className="match-card-header">
                    <div className="match-avatar">
                      {(match.lawyer.user?.name || 'L').split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="match-card-info">
                      <span className="match-name">{match.lawyer.user?.name || 'Lawyer'}</span>
                      <span className="match-title">{match.lawyer.title}</span>
                    </div>
                    <span className={`status-badge status-${match.status.toLowerCase()}`}>
                      {match.status}
                    </span>
                  </div>

                  <div className="match-reasons">
                    {match.matchReasons.map(r => (
                      <span key={r} className="match-reason">✓ {r}</span>
                    ))}
                  </div>

                  <div className="match-meta">
                    <span>{match.lawyer.yearsExperience} yrs experience</span>
                    <span>{formatRetainerRange(match.lawyer.retainerMin, match.lawyer.retainerMax, match.lawyer.currency)}</span>
                  </div>

                  <Link to={`/startup/counsel/${match.lawyer.id}`} className="btn-secondary btn-sm">
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
