import { useEffect, useState } from 'react';
import { legalRequestService } from '../../services/legalRequest.service';
import type { LegalRequest } from '../../services/legalRequest.service';
import { PRACTICE_AREAS, JURISDICTIONS } from '../../config/constants';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { Icon } from '../../components/ui/Icon';
import '../dashboard.css';

export default function LawyerRequestsPage() {
  const [requests, setRequests] = useState<LegalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [selectedMatterType, setSelectedMatterType] = useState('');

  useEffect(() => {
    legalRequestService
      .getPublicRequests()
      .then((res) => setRequests(res.requests || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (selectedJurisdiction && r.jurisdiction !== selectedJurisdiction) return false;
    if (selectedMatterType && r.matterType !== selectedMatterType) return false;
    return true;
  });

  if (isLoading) return <LoadingState message="Loading open legal requests..." />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Open Legal Requests Marketplace</h1>
          <p>Explore legal advisory and fractional counsel requests submitted by active startups</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <Select
            label="Jurisdiction"
            options={[{ label: 'All Jurisdictions', value: '' }, ...JURISDICTIONS.map((j) => ({ label: j, value: j }))]}
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Select
            label="Practice Area"
            options={[{ label: 'All Practice Areas', value: '' }, ...PRACTICE_AREAS.map((pa) => ({ label: pa, value: pa }))]}
            value={selectedMatterType}
            onChange={(e) => setSelectedMatterType(e.target.value)}
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <h3>No Open Legal Requests Found</h3>
          <p style={{ color: 'var(--color-slate-600)', margin: 'var(--space-2) 0' }}>
            There are currently no active legal requests matching your filter criteria.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredRequests.map((req) => (
            <Card key={req.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <Badge variant="primary">{req.matterType}</Badge>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>
                    <Icon name="clock" /> {req.expectedHours} hrs/mo
                  </span>
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
                  {req.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-600)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {req.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <Badge variant="gold">{req.jurisdiction}</Badge>
                <Badge variant="neutral">{req.industry}</Badge>
                <Badge variant="neutral">{req.urgency} Urgency</Badge>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', display: 'block' }}>Monthly Budget</span>
                  <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-navy)' }}>
                    {formatCurrency(req.budgetMin, req.currency)} - {formatCurrency(req.budgetMax, req.currency)}
                  </strong>
                </div>
                <Button variant="secondary" size="sm">
                  Apply / Express Interest
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
