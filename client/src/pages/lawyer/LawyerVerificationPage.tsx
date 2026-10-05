import { useState, useEffect } from 'react';
import { lawyerService } from '../../services/lawyer.service';
import type { LawyerProfile } from '../../services/lawyer.service';
import { verificationService } from '../../services/verification.service';
import type { LawyerVerificationStatus } from '../../services/verification.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { Icon } from '../../components/ui/Icon';
import '../dashboard.css';

export default function LawyerVerificationPage() {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [verifStatus, setVerifStatus] = useState<LawyerVerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [barNumber, setBarNumber] = useState('');
  const [licensingBody, setLicensingBody] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [profData, statusData] = await Promise.all([
        lawyerService.getProfile(),
        verificationService.getLawyerVerificationStatus(),
      ]);
      setProfile(profData);
      setVerifStatus(statusData);
      if (profData.jurisdictions.length > 0) {
        setLicensingBody(profData.jurisdictions[0]);
      }
      if (profData.user?.email) {
        setProfessionalEmail(profData.user.email);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load verification status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await verificationService.submitLawyerVerification(profile.id, {
        barNumber,
        licensingBody,
        professionalEmail: professionalEmail || undefined,
        linkedinUrl: linkedinUrl || undefined,
        additionalNotes: additionalNotes || undefined,
      });
      setSubmittedSuccess(true);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit verification details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading verification status..." />;

  const currentStatus = verifStatus?.verificationStatus || profile?.verificationStatus || 'PENDING';
  const isVerified = currentStatus === 'VERIFIED';
  const isSubmitted = currentStatus === 'SUBMITTED';
  const isRejected = currentStatus === 'REJECTED';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Bar Credentials Verification</h1>
          <p>Verified counsel status unlocks automated matching and builds immediate trust with startups</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-error)' }}>
          {errorMsg}
        </div>
      )}

      <div className="grid-2col">
        <Card title="Current Verification Status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {isVerified ? (
                <span className="verified-badge" style={{ fontSize: 'var(--text-sm)', padding: '6px 14px' }}>
                  <Icon name="check" size={16} /> VERIFIED COUNSEL
                </span>
              ) : isSubmitted ? (
                <Badge variant="warning">Verification Under Review (Submitted)</Badge>
              ) : isRejected ? (
                <Badge variant="error">Verification Rejected</Badge>
              ) : (
                <Badge variant="default">Pending Verification</Badge>
              )}
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-dark)', lineHeight: 1.6 }}>
              {isVerified
                ? 'Your bar license credentials have been independently verified by Counselly compliance. Verified counsel badges are displayed prominently to all clients, and your profile is eligible for automatic matching.'
                : isSubmitted
                ? 'Your bar registration submission is currently being reviewed by our legal operations team. Review typically completes within 1 business day.'
                : isRejected
                ? 'Your previous verification submission was not approved. Please review the factual rejection reason below and resubmit updated details.'
                : 'Please submit your state bar registration details below to verify your active legal standing.'}
            </p>

            {isRejected && verifStatus?.verificationRejectionReason && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)' }}>
                <strong style={{ display: 'block', color: 'var(--color-error)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Reason for Rejection:
                </strong>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-black)' }}>
                  {verifStatus.verificationRejectionReason}
                </p>
                {verifStatus.verificationReviewedAt && (
                  <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-gray-mid)', marginTop: '6px' }}>
                    Reviewed on: {new Date(verifStatus.verificationReviewedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {isSubmitted && verifStatus?.verificationSubmittedAt && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-mid)' }}>
                Submitted at: {new Date(verifStatus.verificationSubmittedAt).toLocaleString()}
              </div>
            )}

            <div style={{ padding: 'var(--space-4)', background: 'var(--color-ivory)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-light)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-dark)', textTransform: 'uppercase', marginBottom: '8px' }}>
                VERIFICATION CHECKLIST
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isVerified ? 'var(--color-success)' : 'var(--color-gray-dark)' }}>
                  <Icon name={isVerified ? 'check' : 'shield'} size={16} /> Active License in Good Standing
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isVerified ? 'var(--color-success)' : 'var(--color-gray-dark)' }}>
                  <Icon name={isVerified ? 'check' : 'shield'} size={16} /> Identity & Law Degree Verification
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isVerified ? 'var(--color-success)' : 'var(--color-gray-dark)' }}>
                  <Icon name={isVerified ? 'check' : 'shield'} size={16} /> Counselly Verified Badge & Matching Eligibility
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title={isVerified ? "Verification Completed" : isRejected ? "Resubmit Credentials" : "Submit Bar Credentials"}>
          {isVerified ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <Icon name="check" size={48} />
              <h3 style={{ margin: 'var(--space-2) 0', color: 'var(--color-black)' }}>Credentials Fully Verified</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-dark)' }}>
                No further action required. Your active bar status is confirmed and your profile is eligible for automatic matching with startups.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {submittedSuccess && (
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-success)' }}>
                  Credentials successfully submitted! Our compliance team has received your verification request.
                </div>
              )}
              <Input
                label="State Bar / Law Society ID Number"
                placeholder="e.g. BAR-987654 / D/1234/2012"
                value={barNumber}
                onChange={(e) => setBarNumber(e.target.value)}
                required
                disabled={isSubmitted}
              />
              <Input
                label="Primary Jurisdiction / Licensing Body"
                placeholder="e.g. Bar Council of Delhi / State Bar of California"
                value={licensingBody}
                onChange={(e) => setLicensingBody(e.target.value)}
                required
                disabled={isSubmitted}
              />
              <Input
                label="Professional / Chamber Email"
                placeholder="lawyer@chamber.com"
                value={professionalEmail}
                onChange={(e) => setProfessionalEmail(e.target.value)}
                disabled={isSubmitted}
              />
              <Input
                label="LinkedIn Profile or Bar Directory Link"
                placeholder="https://linkedin.com/in/advocate"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                disabled={isSubmitted}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-charcoal)' }}>
                  Additional Verification Notes (Optional)
                </label>
                <textarea
                  style={{
                    padding: 'var(--space-3)',
                    border: '1px solid var(--color-gray-light)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    minHeight: '80px',
                    resize: 'vertical',
                  }}
                  placeholder="Any details regarding year of enrollment, specializations, or verification contact."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  disabled={isSubmitted}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitted || !barNumber.trim() || !licensingBody.trim()}
              >
                {isSubmitted ? 'Verification Under Review' : isRejected ? 'Resubmit Verification' : 'Submit Credentials for Verification'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
