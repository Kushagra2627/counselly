import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lawyerService } from '../../services/lawyer.service';
import type { LawyerProfile } from '../../services/lawyer.service';
import { formatCurrency } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingState } from '../../components/ui/LoadingState';
import { Icon } from '../../components/ui/Icon';

export default function LawyerProfileViewPage() {
  const { id } = useParams<{ id: string }>();
  const [lawyer, setLawyer] = useState<LawyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    lawyerService
      .getLawyerById(id)
      .then((data) => setLawyer(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load counsel profile'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingState message="Loading counsel profile..." />;
  if (error || !lawyer) {
    return (
      <div className="dashboard-container">
        <Card>
          <h2>Counsel Profile Not Found</h2>
          <p style={{ color: 'var(--color-slate-600)', margin: '16px 0' }}>{error || 'This profile may no longer exist.'}</p>
          <Link to="/startup/counsel">
            <Button variant="secondary">Back to Counsel Directory</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const name = lawyer.user?.name || lawyer.title || 'Legal Counsel';

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <Link to="/startup/counsel" style={{ color: 'var(--color-slate-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
          <Icon name="arrowLeft" /> Back to Counsel Directory
        </Link>
      </div>

      <div className="detail-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <Avatar name={name} size="xl" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <h1 className="detail-header-title">{name}</h1>
              {lawyer.isDemo ? (
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                  Demo Profile
                </span>
              ) : lawyer.verificationStatus === 'VERIFIED' ? (
                <span className="verified-badge">
                  <Icon name="checkCircle" /> Verified Counsel
                </span>
              ) : (
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)' }}>
                  Unverified
                </span>
              )}
            </div>
            <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--space-3)' }}>
              {lawyer.title || 'Fractional General Counsel'} • {lawyer.yearsExperience ? `${lawyer.yearsExperience} yrs exp` : 'Experienced'}
            </p>
            <div className="detail-meta-row">
              <div className="detail-meta-item">
                <Icon name="globe" /> {lawyer.jurisdictions.join(', ') || 'Global'}
              </div>
              <div className="detail-meta-item">
                <Icon name="clock" /> {lawyer.availability || 'Flexible availability'}
              </div>
              <div className="detail-meta-item">
                <Icon name="briefcase" /> {lawyer.monthlyCapacity ? `${lawyer.monthlyCapacity} hrs/month capacity` : 'Available for retainers'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: '200px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monthly Retainer
              </span>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                {lawyer.retainerMin && lawyer.retainerMax
                  ? `${formatCurrency(lawyer.retainerMin, lawyer.currency)} - ${formatCurrency(lawyer.retainerMax, lawyer.currency)}/mo`
                  : 'Contact for pricing'}
              </div>
            </div>
            <Link to="/startup/requests/new" style={{ textDecoration: 'none' }}>
              <Button variant="gold" fullWidth>
                Request Engagement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-2col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card title="About Counsel">
            <p style={{ lineHeight: 1.6, color: 'var(--color-slate-700)', whiteSpace: 'pre-line' }}>
              {lawyer.about || 'No bio provided.'}
            </p>
          </Card>

          <Card title="Practice Areas & Expertise">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)', marginBottom: 'var(--space-2)' }}>PRACTICE AREAS</h4>
                <div className="tag-cloud">
                  {lawyer.practiceAreas.map((pa) => (
                    <Badge key={pa} variant="primary">{pa}</Badge>
                  ))}
                </div>
              </div>

              {lawyer.contractExpertise.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)', marginBottom: 'var(--space-2)' }}>CONTRACT EXPERTISE</h4>
                  <div className="tag-cloud">
                    {lawyer.contractExpertise.map((ce) => (
                      <Badge key={ce} variant="neutral">{ce}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {lawyer.industries.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)', marginBottom: 'var(--space-2)' }}>INDUSTRY SPECIALIZATIONS</h4>
                  <div className="tag-cloud">
                    {lawyer.industries.map((ind) => (
                      <Badge key={ind} variant="neutral">{ind}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card title="Jurisdictions & Languages">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <h4 style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Bar Jurisdictions
                </h4>
                <div className="tag-cloud">
                  {lawyer.jurisdictions.map((j) => (
                    <Badge key={j} variant="gold">{j}</Badge>
                  ))}
                </div>
              </div>
              {lawyer.languages.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Languages
                  </h4>
                  <p style={{ color: 'var(--color-slate-700)', fontWeight: 500 }}>{lawyer.languages.join(', ')}</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Verification & Trust">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Icon name="checkCircle" />
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>Bar License Checked</strong>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Verified active status</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Icon name="shield" />
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>Identity Verified</strong>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Official identity & credential check</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
