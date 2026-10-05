import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { verificationService } from '../../services/verification.service';
import type { VerificationSubmissionRecord } from '../../services/verification.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { Icon } from '../../components/ui/Icon';
import '../dashboard.css';
import './admin.css';

export default function AdminVerificationReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<VerificationSubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadSubmission = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await verificationService.adminGetSubmission(id);
      if (!data) throw new Error('Verification submission not found');
      setSubmission(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load submission details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  const handleApprove = async () => {
    if (!submission) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      if (submission.entityType === 'LAWYER') {
        await verificationService.adminReviewLawyer(submission.entityId, 'VERIFY');
      } else {
        await verificationService.adminReviewStartup(submission.entityId, 'VERIFY');
      }
      setActionSuccess('Verification successfully approved! Account has been updated to VERIFIED.');
      await loadSubmission();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to approve verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;
    if (!rejectionReason.trim()) {
      setErrorMsg('Please specify a factual rejection reason to help the user remediate their submission.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      if (submission.entityType === 'LAWYER') {
        await verificationService.adminReviewLawyer(submission.entityId, 'REJECT', rejectionReason.trim());
      } else {
        await verificationService.adminReviewStartup(submission.entityId, 'REJECT', rejectionReason.trim());
      }
      setActionSuccess('Verification rejected. The user has been notified of the rejection reason.');
      setShowRejectForm(false);
      await loadSubmission();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reject verification');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading verification submission..." />;

  if (!submission) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <h2>Submission Not Found</h2>
          <p style={{ color: 'var(--color-gray-dark)', margin: 'var(--space-4) 0' }}>
            The requested verification record could not be loaded.
          </p>
          <Link to="/admin/verification">
            <Button variant="secondary">Back to Queue</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLawyer = submission.entityType === 'LAWYER';
  const isPending = submission.status === 'SUBMITTED';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Link to="/admin/verification" style={{ color: 'var(--color-gray-dark)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>
              <Icon name="chevron-left" size={14} /> Back to Verification Queue
            </Link>
          </div>
          <h1>Review {submission.entityType} Verification</h1>
          <p>Carefully verify factual bar registration / corporate identification against official regulatory records</p>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-success)' }}>
          {actionSuccess}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-error)' }}>
          {errorMsg}
        </div>
      )}

      <div className="admin-review-grid">
        <Card title="Submitted Information">
          <div className="admin-detail-section">
            <div className="admin-detail-row">
              <span className="admin-detail-label">Entity Category</span>
              <span className="admin-detail-value">
                <span className={`admin-entity-badge ${isLawyer ? 'admin-entity-badge--lawyer' : 'admin-entity-badge--startup'}`}>
                  {submission.entityType}
                </span>
              </span>
            </div>

            <div className="admin-detail-row">
              <span className="admin-detail-label">Submission Date</span>
              <span className="admin-detail-value">{new Date(submission.submittedAt).toLocaleString()}</span>
            </div>

            {isLawyer ? (
              <>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Bar / Law Society ID Number</span>
                  <span className="admin-detail-value" style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)' }}>
                    {submission.barNumber || 'Not provided'}
                  </span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Licensing Jurisdiction & Council</span>
                  <span className="admin-detail-value">{submission.licensingBody || 'Not provided'}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Professional / Chamber Email</span>
                  <span className="admin-detail-value">{submission.professionalEmail || 'Not provided'}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">LinkedIn / Directory URL</span>
                  <span className="admin-detail-value">
                    {submission.linkedinUrl ? (
                      <a href={submission.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>
                        {submission.linkedinUrl} ↗
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </span>
                </div>
                {submission.additionalNotes && (
                  <div className="admin-detail-row">
                    <span className="admin-detail-label">Applicant Notes</span>
                    <span className="admin-detail-value">{submission.additionalNotes}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Registered Corporate Name</span>
                  <span className="admin-detail-value" style={{ fontSize: 'var(--text-base)' }}>
                    {submission.companyLegalName || 'Not provided'}
                  </span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Business Registration Identifier (CIN / EIN)</span>
                  <span className="admin-detail-value" style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)' }}>
                    {submission.businessRegistrationNumber || 'Not provided'}
                  </span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Corporate Website</span>
                  <span className="admin-detail-value">
                    {submission.companyWebsite ? (
                      <a href={submission.companyWebsite} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>
                        {submission.companyWebsite} ↗
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Authorized Signatory / Representative</span>
                  <span className="admin-detail-value">{submission.authorizedRepresentative || 'Not provided'}</span>
                </div>
                {submission.representativeDesignation && (
                  <div className="admin-detail-row">
                    <span className="admin-detail-label">Signatory Corporate Designation</span>
                    <span className="admin-detail-value">{submission.representativeDesignation}</span>
                  </div>
                )}
              </>
            )}

            <div className="admin-detail-row">
              <span className="admin-detail-label">Database Entity ID</span>
              <span className="admin-detail-value" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-dark)', fontFamily: 'monospace' }}>
                {submission.entityId}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Compliance Action">
          <div className="admin-action-panel">
            <div>
              <span className="admin-detail-label">Current Status</span>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <Badge variant={submission.status === 'VERIFIED' ? 'success' : submission.status === 'REJECTED' ? 'error' : 'warning'}>
                  {submission.status}
                </Badge>
              </div>
            </div>

            {submission.reviewedAt && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-mid)' }}>
                Reviewed on {new Date(submission.reviewedAt).toLocaleString()}
              </div>
            )}

            {submission.rejectionReason && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)' }}>
                <span className="admin-detail-label" style={{ color: 'var(--color-error)' }}>Recorded Rejection Reason</span>
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-black)' }}>
                  {submission.rejectionReason}
                </p>
              </div>
            )}

            {isPending ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <Button
                  variant="primary"
                  loading={isProcessing}
                  onClick={handleApprove}
                >
                  Approve & Grant Verified Status
                </Button>

                {!showRejectForm ? (
                  <Button
                    variant="danger"
                    disabled={isProcessing}
                    onClick={() => setShowRejectForm(true)}
                  >
                    Reject Submission...
                  </Button>
                ) : (
                  <form onSubmit={handleReject} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-error)', textTransform: 'uppercase' }}>
                      Factual Reason for Rejection (Required)
                    </label>
                    <textarea
                      className="admin-rejection-textarea"
                      placeholder="e.g. Bar registration number BAR-12345 could not be validated on the Bar Council directory. Please submit updated license certificate."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Button type="submit" variant="danger" size="sm" loading={isProcessing}>
                        Confirm Rejection
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowRejectForm(false)} disabled={isProcessing}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-dark)' }}>
                  This submission has been finalized. If the applicant resubmits, a new review request will appear in the queue.
                </p>
                <Button variant="secondary" size="sm" onClick={() => navigate('/admin/verification')}>
                  Return to Queue
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
