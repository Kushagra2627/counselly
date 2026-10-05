import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { startupService } from '../../services/startup.service';
import { legalRequestService } from '../../services/legalRequest.service';
import {
  INDUSTRIES, JURISDICTIONS, COMPANY_SIZES, MATTER_TYPES,
  SUPPORTED_CURRENCIES, AVAILABILITY_OPTIONS, URGENCY_LABELS,
  PRACTICE_AREAS
} from '../../config/constants';
import './onboarding.css';

const STEPS = [
  'Company Profile',
  'Legal Requirement',
  'Review & Finish',
];

interface StartupFormData {
  // Step 1 — Company Profile
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
  country: string;
  jurisdiction: string;
  description: string;
  // Step 2 — Legal Requirement (first request)
  matterType: string;
  requirementDescription: string;
  requirementIndustry: string;
  requirementJurisdiction: string;
  requiredExpertise: string[];
  budgetMin: string;
  budgetMax: string;
  currency: string;
  expectedHours: string;
  urgency: string;
  availability: string;
}

const INITIAL_FORM: StartupFormData = {
  companyName: '', website: '', industry: '', companySize: '',
  country: '', jurisdiction: '', description: '',
  matterType: '', requirementDescription: '', requirementIndustry: '',
  requirementJurisdiction: '', requiredExpertise: [],
  budgetMin: '', budgetMax: '', currency: 'INR',
  expectedHours: '', urgency: 'MEDIUM', availability: 'Within 2 weeks',
};

export default function StartupOnboardingPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<StartupFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof StartupFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing progress
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      try {
        const profile = await startupService.getProfile();
        if (profile.onboardingDone) {
          navigate('/startup/overview');
          return;
        }
        setStep(profile.onboardingStep || 0);
        setForm(f => ({
          ...f,
          companyName: profile.companyName || '',
          website: profile.website || '',
          industry: profile.industry || '',
          companySize: profile.companySize || '',
          country: profile.country || '',
          jurisdiction: profile.jurisdiction || '',
          description: profile.description || '',
        }));
      } catch {
        // No profile yet — start from step 0
      } finally {
        setIsLoading(false);
      }
    };
    loadProgress();
  }, [navigate]);

  const set = (field: keyof StartupFormData, value: string | string[]) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  const toggleExpertise = (item: string) => {
    set('requiredExpertise', form.requiredExpertise.includes(item)
      ? form.requiredExpertise.filter(e => e !== item)
      : [...form.requiredExpertise, item]
    );
  };

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.companyName.trim()) e.companyName = 'Company name is required.';
    if (!form.industry) e.industry = 'Please select your industry.';
    if (!form.jurisdiction) e.jurisdiction = 'Please select your jurisdiction.';
    if (!form.companySize) e.companySize = 'Please select company size.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!form.matterType) e.matterType = 'Please select a matter type.';
    if (!form.requirementDescription.trim()) e.requirementDescription = 'Description is required.';
    if (!form.requirementJurisdiction) e.requirementJurisdiction = 'Jurisdiction is required.';
    if (!form.budgetMin || isNaN(Number(form.budgetMin))) e.budgetMin = 'Enter a valid minimum budget.';
    if (!form.budgetMax || isNaN(Number(form.budgetMax))) e.budgetMax = 'Enter a valid maximum budget.';
    if (Number(form.budgetMin) > Number(form.budgetMax)) e.budgetMax = 'Max budget must be ≥ min budget.';
    if (!form.expectedHours || isNaN(Number(form.expectedHours))) e.expectedHours = 'Enter expected hours per month.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveStep1 = async () => {
    if (!validateStep1()) return;
    setIsSaving(true);
    try {
      await startupService.updateProfile({
        companyName: form.companyName,
        website: form.website || undefined,
        industry: form.industry,
        companySize: form.companySize,
        country: form.country || undefined,
        jurisdiction: form.jurisdiction,
        description: form.description || undefined,
        onboardingStep: 1,
      } as any);
      setStep(1);
    } catch (err: any) {
      setErrors({ companyName: err?.response?.data?.message || 'Save failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const saveStep2 = async () => {
    if (!validateStep2()) return;
    setIsSaving(true);
    try {
      // Create the first legal request
      await legalRequestService.createRequest({
        title: form.matterType,
        matterType: form.matterType,
        description: form.requirementDescription,
        industry: form.requirementIndustry || form.industry,
        jurisdiction: form.requirementJurisdiction,
        requiredExpertise: form.requiredExpertise,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        currency: form.currency,
        expectedHours: Number(form.expectedHours),
        urgency: form.urgency,
        availability: form.availability,
      });
      await startupService.updateProfile({ onboardingStep: 2 } as any);
      setStep(2);
    } catch (err: any) {
      setErrors({ requirementDescription: err?.response?.data?.message || 'Save failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const finish = async () => {
    setIsSaving(true);
    try {
      await startupService.updateProfile({ onboardingDone: true } as any);
      await refreshUser();
      navigate('/startup/overview');
    } catch {
      // still navigate
      navigate('/startup/overview');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="onboarding-loading">
        <div className="onboarding-spinner" />
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <div className="onboarding-wordmark">Counselly</div>
      </header>

      <main className="onboarding-main">
        <div className="onboarding-card">
          {/* Progress */}
          <div className="onboarding-progress">
            {STEPS.map((label, i) => (
              <div key={label} className={`progress-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="progress-dot">{i < step ? '✓' : i + 1}</div>
                <span className="progress-label">{label}</span>
                {i < STEPS.length - 1 && <div className="progress-line" />}
              </div>
            ))}
          </div>

          {/* Step 1 — Company Profile */}
          {step === 0 && (
            <div className="onboarding-step">
              <h1>Tell us about your company</h1>
              <p className="step-subtitle">This helps us match you with the right legal counsel.</p>

              <div className="form-grid">
                <div className={`form-field ${errors.companyName ? 'has-error' : ''}`}>
                  <label>Company name *</label>
                  <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Acme Technologies Pvt. Ltd." />
                  {errors.companyName && <span className="field-error">{errors.companyName}</span>}
                </div>

                <div className="form-field">
                  <label>Website</label>
                  <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourcompany.com" type="url" />
                </div>

                <div className={`form-field ${errors.industry ? 'has-error' : ''}`}>
                  <label>Industry *</label>
                  <select value={form.industry} onChange={e => set('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  {errors.industry && <span className="field-error">{errors.industry}</span>}
                </div>

                <div className={`form-field ${errors.companySize ? 'has-error' : ''}`}>
                  <label>Company size *</label>
                  <select value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.companySize && <span className="field-error">{errors.companySize}</span>}
                </div>

                <div className="form-field">
                  <label>Country</label>
                  <input value={form.country} onChange={e => set('country', e.target.value)} placeholder="India" />
                </div>

                <div className={`form-field ${errors.jurisdiction ? 'has-error' : ''}`}>
                  <label>Primary jurisdiction *</label>
                  <select value={form.jurisdiction} onChange={e => set('jurisdiction', e.target.value)}>
                    <option value="">Select jurisdiction</option>
                    {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                  {errors.jurisdiction && <span className="field-error">{errors.jurisdiction}</span>}
                </div>

                <div className="form-field form-field--full">
                  <label>Company description</label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Briefly describe what your company does..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="onboarding-actions">
                <button className="btn-onboarding-primary" onClick={saveStep1} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Legal Requirement */}
          {step === 1 && (
            <div className="onboarding-step">
              <h1>Describe your legal need</h1>
              <p className="step-subtitle">We'll use this to find counsel whose expertise matches your requirements.</p>

              <div className="form-grid">
                <div className={`form-field form-field--full ${errors.matterType ? 'has-error' : ''}`}>
                  <label>Type of legal matter *</label>
                  <select value={form.matterType} onChange={e => set('matterType', e.target.value)}>
                    <option value="">Select matter type</option>
                    {MATTER_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {errors.matterType && <span className="field-error">{errors.matterType}</span>}
                </div>

                <div className={`form-field form-field--full ${errors.requirementDescription ? 'has-error' : ''}`}>
                  <label>Describe your legal requirement *</label>
                  <textarea
                    value={form.requirementDescription}
                    onChange={e => set('requirementDescription', e.target.value)}
                    placeholder="Describe what legal support you need, any specific contracts, compliance matters, or ongoing advisory you're looking for..."
                    rows={4}
                  />
                  {errors.requirementDescription && <span className="field-error">{errors.requirementDescription}</span>}
                </div>

                <div className={`form-field ${errors.requirementJurisdiction ? 'has-error' : ''}`}>
                  <label>Jurisdiction *</label>
                  <select value={form.requirementJurisdiction} onChange={e => set('requirementJurisdiction', e.target.value)}>
                    <option value="">Select jurisdiction</option>
                    {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                  {errors.requirementJurisdiction && <span className="field-error">{errors.requirementJurisdiction}</span>}
                </div>

                <div className="form-field">
                  <label>Industry context</label>
                  <select value={form.requirementIndustry} onChange={e => set('requirementIndustry', e.target.value)}>
                    <option value="">Same as company ({form.industry})</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                {/* Required expertise — multi-select chips */}
                <div className="form-field form-field--full">
                  <label>Required expertise areas</label>
                  <div className="chip-select">
                    {PRACTICE_AREAS.map(area => (
                      <button
                        key={area}
                        type="button"
                        className={`chip ${form.requiredExpertise.includes(area) ? 'chip--selected' : ''}`}
                        onClick={() => toggleExpertise(area)}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="form-field">
                  <label>Currency *</label>
                  <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Expected hours / month *</label>
                  <input
                    type="number"
                    value={form.expectedHours}
                    onChange={e => set('expectedHours', e.target.value)}
                    placeholder="20"
                    min="1"
                  />
                  {errors.expectedHours && <span className="field-error">{errors.expectedHours}</span>}
                </div>

                <div className={`form-field ${errors.budgetMin ? 'has-error' : ''}`}>
                  <label>Monthly budget minimum *</label>
                  <input
                    type="number"
                    value={form.budgetMin}
                    onChange={e => set('budgetMin', e.target.value)}
                    placeholder="e.g. 50000"
                    min="0"
                  />
                  {errors.budgetMin && <span className="field-error">{errors.budgetMin}</span>}
                </div>

                <div className={`form-field ${errors.budgetMax ? 'has-error' : ''}`}>
                  <label>Monthly budget maximum *</label>
                  <input
                    type="number"
                    value={form.budgetMax}
                    onChange={e => set('budgetMax', e.target.value)}
                    placeholder="e.g. 80000"
                    min="0"
                  />
                  {errors.budgetMax && <span className="field-error">{errors.budgetMax}</span>}
                </div>

                <div className="form-field">
                  <label>Urgency</label>
                  <select value={form.urgency} onChange={e => set('urgency', e.target.value)}>
                    {Object.entries(URGENCY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Preferred availability</label>
                  <select value={form.availability} onChange={e => set('availability', e.target.value)}>
                    {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="onboarding-actions">
                <button className="btn-onboarding-secondary" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-onboarding-primary" onClick={saveStep2} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 2 && (
            <div className="onboarding-step onboarding-step--review">
              <div className="review-check">✓</div>
              <h1>You're all set</h1>
              <p className="step-subtitle">
                Your company profile and first legal request have been saved. We'll begin finding
                matched counsel based on your requirements.
              </p>

              <div className="review-summary">
                <div className="review-item">
                  <span className="review-label">Company</span>
                  <span className="review-value">{form.companyName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Industry</span>
                  <span className="review-value">{form.industry}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Jurisdiction</span>
                  <span className="review-value">{form.jurisdiction}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Legal need</span>
                  <span className="review-value">{form.matterType}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Monthly budget</span>
                  <span className="review-value">{form.currency} {form.budgetMin}–{form.budgetMax}</span>
                </div>
              </div>

              <div className="onboarding-actions">
                <button className="btn-onboarding-primary" onClick={finish} disabled={isSaving}>
                  {isSaving ? 'Setting up your dashboard…' : 'Go to Dashboard →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
