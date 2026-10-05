import { useState, useEffect } from 'react';
import { startupService } from '../../services/startup.service';
import type { StartupProfile } from '../../services/startup.service';
import { verificationService } from '../../services/verification.service';
import type { StartupVerificationStatus } from '../../services/verification.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { Icon } from '../../components/ui/Icon';

export default function StartupVerificationPage() {
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [verifStatus, setVerifStatus] = useState<StartupVerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyLegalName, setCompanyLegalName] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [authorizedRepresentative, setAuthorizedRepresentative] = useState('');
  const [representativeDesignation, setRepresentativeDesignation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [profData, statusData] = await Promise.all([
        startupService.getProfile(),
        verificationService.getStartupVerificationStatus(),
      ]);
      setProfile(profData);
      setVerifStatus(statusData);
      if (profData.companyName) {
        setCompanyLegalName(profData.companyName);
      }
      if (profData.website) {
        setCompanyWebsite(profData.website);
      }
      if (profData.user?.name) {
        setAuthorizedRepresentative(profData.user.name);
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
      await verificationService.submitStartupVerification(profile.id, {
        companyLegalName,
        businessRegistrationNumber,
        companyWebsite: companyWebsite || undefined,
        authorizedRepresentative,
        representativeDesignation: representativeDesignation || undefined,
      });
      setSubmittedSuccess(true);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit verification details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading company verification status..." />;

  const currentStatus = verifStatus?.verificationStatus || profile?.verificationStatus || 'PENDING';
  const isVerified = currentStatus === 'VERIFIED';
  const isSubmitted = currentStatus === 'SUBMITTED';
  const isRejected = currentStatus === 'REJECTED';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Company Verification</h1>
          <p>Verify your entity registration to access dedicated fractional general counsel engagements</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--color-error-light)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-error)' }}>
          {errorMsg}
        </div>
      )}

      <div className="grid-2col">
        <Card title="Company Verification Status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {isVerified ? (
                <span className="verified-badge" style={{ fontSize: 'var(--text-sm)', padding: '6px 14px' }}>
                  <Icon name="check" size={16} /> VERIFIED ENTITY
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
                ? 'Your company registration has been verified by Counselly compliance. Your enterprise has access to priority legal matching and direct engagement signing.'
                : isSubmitted
                ? 'Your company verification submission is currently under review by our legal operations team. Review typically takes 1 business day.'
                : isRejected
                ? 'Your company verification was not approved. Please see the factual reason below and update your registration information.'
                : 'Submit your business registration number and corporate entity information to confirm your corporate legal standing.'}
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
                Submitted on: {new Date(verifStatus.verificationSubmittedAt).toLocaleString()}
              </div>
            )}

            <div style={{ padding: 'var(--space-4)', background: 'var(--color-ivory)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-light)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-dark)', textTransform: 'uppercase', marginBottom: '8px' }}>
                CORPORATE VERIFICATION STANDARDS
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isVerified ? 'var(--color-success)' : 'var(--color-gray-dark)' }}>
                  <Icon name={isVerified ? 'check' : 'shield'} size={16} /> Validated Business Registry Identification (CIN / EIN / Company No.)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isVerified ? 'var(--color-success)' : 'var(--color-gray-dark)' }}>
                  <Icon name={isVerified ? 'check' : 'shield'} size={16} /> Authorized Corporate Officer Signatory
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isVerified ? 'var(--color-success)' : 'var(--color-gray-dark)' }}>
                  <Icon name={isVerified ? 'check' : 'shield'} size={16} /> Verified Entity Badge for Legal Counsel
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title={isVerified ? "Entity Verified" : isRejected ? "Resubmit Company Details" : "Submit Entity Details"}>
          {isVerified ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <Icon name="check" size={48} />
              <h3 style={{ margin: 'var(--space-2) 0', color: 'var(--color-black)' }}>Entity Fully Verified</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-dark)' }}>
                Your business entity is verified. You can post legal requests, receive matched counsel, and enter retainers.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {submittedSuccess && (
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', border: '1px solid var(--color-success)' }}>
                  Verification details submitted! Counselly compliance will review your company registration.
                </div>
              )}
              <Input
                label="Registered Legal Entity Name"
                placeholder="e.g. Acme Technologies Private Limited / Acme Inc."
                value={companyLegalName}
                onChange={(e) => setCompanyLegalName(e.target.value)}
                required
                disabled={isSubmitted}
              />
              <Input
                label="Business Registration Identifier (CIN / EIN / Reg No.)"
                placeholder="e.g. U72200KA2021PTC123456 / 12-3456789"
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                required
                disabled={isSubmitted}
              />
              <Input
                label="Company Website / Domain"
                placeholder="https://acme.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                disabled={isSubmitted}
              />
              <Input
                label="Authorized Representative Full Name"
                placeholder="Full Name of Officer or Founder"
                value={authorizedRepresentative}
                onChange={(e) => setAuthorizedRepresentative(e.target.value)}
                required
                disabled={isSubmitted}
              />
              <Input
                label="Representative Designation / Title"
                placeholder="e.g. Founder & CEO / Director / Managing Member"
                value={representativeDesignation}
                onChange={(e) => setRepresentativeDesignation(e.target.value)}
                disabled={isSubmitted}
              />

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitted || !companyLegalName.trim() || !businessRegistrationNumber.trim() || !authorizedRepresentative.trim()}
              >
                {isSubmitted ? 'Verification Under Review' : isRejected ? 'Resubmit Verification' : 'Submit Company Verification'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
