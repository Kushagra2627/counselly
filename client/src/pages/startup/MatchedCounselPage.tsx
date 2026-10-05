import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lawyerService } from '../../services/lawyer.service';
import type { LawyerProfile, LawyerFilters } from '../../services/lawyer.service';
import { PRACTICE_AREAS, JURISDICTIONS, AVAILABILITY_OPTIONS, SUPPORTED_CURRENCIES } from '../../config/constants';
import { formatRetainerRange } from '../../utils/formatters';
import '../dashboard.css';

export default function MatchedCounselPage() {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<LawyerFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const load = async (f?: LawyerFilters) => {
    setIsLoading(true);
    try {
      const data = await lawyerService.getLawyers(f);
      setLawyers(data);
    } catch { /* silent */ } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const applyFilter = (key: keyof LawyerFilters, value: string) => {
    const next = { ...filters, [key]: value || undefined };
    setFilters(next);
    load(next);
  };

  const clearFilters = () => { setFilters({}); load(); };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  if (isLoading) return <div className="dashboard-loading"><div className="dash-spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Matched Counsel</h1>
          <p>Lawyers whose expertise, jurisdiction, and retainer match your requirements.</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowFilters(f => !f)}>
          Filters {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="form-field">
              <label>Practice Area</label>
              <select value={filters.practiceArea || ''} onChange={e => applyFilter('practiceArea', e.target.value)}>
                <option value="">All practice areas</option>
                {PRACTICE_AREAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Jurisdiction</label>
              <select value={filters.jurisdiction || ''} onChange={e => applyFilter('jurisdiction', e.target.value)}>
                <option value="">All jurisdictions</option>
                {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Availability</label>
              <select value={filters.availability || ''} onChange={e => applyFilter('availability', e.target.value)}>
                <option value="">Any availability</option>
                {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Currency</label>
              <select value={filters.currency || ''} onChange={e => applyFilter('currency', e.target.value)}>
                <option value="">Any currency</option>
                {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button className="clear-filters" onClick={clearFilters}>Clear all filters</button>
          )}
        </div>
      )}

      {lawyers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3>No lawyers found</h3>
          <p>Try adjusting your filters or submit a legal request to trigger automatic matching.</p>
        </div>
      ) : (
        <div className="lawyer-cards-grid">
          {lawyers.map(lawyer => (
            <div key={lawyer.id} className="lawyer-card">
              <div className="lawyer-card-header">
                <div className="lawyer-avatar">
                  {(lawyer.user?.name || 'L').split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="lawyer-card-identity">
                  <h4>{lawyer.user?.name || 'Legal Professional'}</h4>
                  <span>{lawyer.title}</span>
                </div>
                <span className="verification-pill">
                  {lawyer.isDemo ? 'Demo Profile' : lawyer.verificationStatus === 'VERIFIED' ? '✓ Verified' : 'Unverified'}
                </span>
              </div>

              <div className="lawyer-card-chips">
                {lawyer.practiceAreas.slice(0, 3).map(p => (
                  <span key={p} className="chip-display">{p}</span>
                ))}
                {lawyer.practiceAreas.length > 3 && (
                  <span className="chip-display chip-display--more">+{lawyer.practiceAreas.length - 3}</span>
                )}
              </div>

              <div className="lawyer-card-meta">
                <span>📍 {lawyer.jurisdictions.slice(0, 2).join(', ')}</span>
                <span>⏱ {lawyer.yearsExperience} yrs experience</span>
                <span>🕐 {lawyer.availability || 'Flexible'}</span>
              </div>

              <div className="lawyer-card-retainer">
                {formatRetainerRange(lawyer.retainerMin, lawyer.retainerMax, lawyer.currency)}
              </div>

              <Link to={`/startup/counsel/${lawyer.id}`} className="btn-secondary btn-block">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
