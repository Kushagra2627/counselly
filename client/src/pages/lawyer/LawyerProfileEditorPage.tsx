import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { lawyerService } from '../../services/lawyer.service';
import type { LawyerProfile } from '../../services/lawyer.service';
import {
  PRACTICE_AREAS,
  INDUSTRIES,
  JURISDICTIONS,
  AVAILABILITY_OPTIONS,
  SUPPORTED_CURRENCIES,
  CONTRACT_EXPERTISE_OPTIONS,
} from '../../config/constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import '../dashboard.css';

export default function LawyerProfileEditorPage() {
  const { refreshUser } = useAuth();
  const [, setProfile] = useState<LawyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    yearsExperience: 5,
    jurisdictions: [] as string[],
    practiceAreas: [] as string[],
    industries: [] as string[],
    contractExpertise: [] as string[],
    languages: ['English'],
    about: '',
    availability: '',
    retainerMin: 50000,
    retainerMax: 200000,
    currency: 'INR',
    monthlyCapacity: 40,
  });

  useEffect(() => {
    lawyerService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setFormData({
          title: data.title || '',
          yearsExperience: data.yearsExperience || 5,
          jurisdictions: data.jurisdictions || [],
          practiceAreas: data.practiceAreas || [],
          industries: data.industries || [],
          contractExpertise: data.contractExpertise || [],
          languages: data.languages.length ? data.languages : ['English'],
          about: data.about || '',
          availability: data.availability || '',
          retainerMin: data.retainerMin || 50000,
          retainerMax: data.retainerMax || 200000,
          currency: data.currency || 'INR',
          monthlyCapacity: data.monthlyCapacity || 40,
        });
      })
      .catch((err) => setErrorMsg(err.response?.data?.message || 'Failed to load lawyer profile'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await lawyerService.updateProfile(formData);
      await refreshUser();
      setSuccessMsg('Lawyer profile updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading lawyer profile..." />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Counsel Profile Editor</h1>
          <p>Update your practice credentials, retainer rates, and monthly bandwidth</p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Card title="Professional Bio & Title">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input
                  label="Professional Title"
                  placeholder="e.g. Fractional GC & Tech Corporate Counsel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  label="Years of Corporate Law Experience"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                  required
                />
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    Professional Biography & Background
                  </label>
                  <textarea
                    rows={5}
                    className="input-field"
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Describe your legal background, past experience with startups, M&A, VC rounds..."
                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </Card>

            <Card title="Practice Areas & Skills">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <MultiSelect
                  label="Bar Jurisdictions"
                  options={JURISDICTIONS}
                  selected={formData.jurisdictions}
                  onChange={(val) => setFormData({ ...formData, jurisdictions: val })}
                />
                <MultiSelect
                  label="Practice Areas"
                  options={PRACTICE_AREAS}
                  selected={formData.practiceAreas}
                  onChange={(val) => setFormData({ ...formData, practiceAreas: val })}
                />
                <MultiSelect
                  label="Contract & Deal Expertise"
                  options={CONTRACT_EXPERTISE_OPTIONS}
                  selected={formData.contractExpertise}
                  onChange={(val) => setFormData({ ...formData, contractExpertise: val })}
                />
                <MultiSelect
                  label="Industry Specializations"
                  options={INDUSTRIES}
                  selected={formData.industries}
                  onChange={(val) => setFormData({ ...formData, industries: val })}
                />
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Card title="Retainer & Capacity">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Select
                  label="Currency"
                  options={SUPPORTED_CURRENCIES.map((c) => ({ label: c, value: c }))}
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <Input
                    type="number"
                    label="Min Monthly Retainer"
                    value={formData.retainerMin}
                    onChange={(e) => setFormData({ ...formData, retainerMin: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    label="Max Monthly Retainer"
                    value={formData.retainerMax}
                    onChange={(e) => setFormData({ ...formData, retainerMax: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Input
                  type="number"
                  label="Monthly Bandwidth Capacity (Hours)"
                  value={formData.monthlyCapacity}
                  onChange={(e) => setFormData({ ...formData, monthlyCapacity: parseInt(e.target.value) || 0 })}
                />
                <Select
                  label="Weekly Availability Model"
                  options={AVAILABILITY_OPTIONS.map((a) => ({ label: a, value: a }))}
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>
            </Card>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save Profile Updates
          </Button>
        </div>
      </form>
    </div>
  );
}
