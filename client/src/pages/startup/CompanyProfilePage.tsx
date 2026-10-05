import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { startupService } from '../../services/startup.service';
import type { StartupProfile } from '../../services/startup.service';
import { INDUSTRIES, JURISDICTIONS, COMPANY_SIZES } from '../../config/constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import '../dashboard.css';

export default function CompanyProfilePage() {
  const { refreshUser } = useAuth();
  const [, setProfile] = useState<StartupProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    country: '',
    jurisdiction: '',
    description: '',
  });

  useEffect(() => {
    startupService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setFormData({
          companyName: data.companyName || '',
          website: data.website || '',
          industry: data.industry || '',
          companySize: data.companySize || '',
          country: data.country || '',
          jurisdiction: data.jurisdiction || '',
          description: data.description || '',
        });
      })
      .catch((err) => setErrorMsg(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await startupService.updateProfile(formData);
      await refreshUser();
      setSuccessMsg('Company profile updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading company profile..." />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Company Profile</h1>
          <p>Manage your startup details and business information</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: 'var(--space-4)', background: '#D1FAE5', color: '#065F46', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: 'var(--space-4)', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2col">
          <Card title="Business Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
              <Input
                label="Website URL"
                placeholder="https://yourcompany.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <Select
                label="Industry Sector"
                options={INDUSTRIES.map((i) => ({ label: i, value: i }))}
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
              <Select
                label="Company Size / Stage"
                options={COMPANY_SIZES.map((s) => ({ label: s, value: s }))}
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              />
            </div>
          </Card>

          <Card title="Jurisdiction & Overview">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Country of Legal Incorporation"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
              <Select
                label="Primary Operating Jurisdiction"
                options={JURISDICTIONS.map((j) => ({ label: j, value: j }))}
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              />
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  Company Description
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your company, products, and legal needs..."
                  style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
