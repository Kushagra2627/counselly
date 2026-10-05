import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { lawyerService } from '../../services/lawyer.service';
import {
  PRACTICE_AREAS, INDUSTRIES, JURISDICTIONS,
  SUPPORTED_CURRENCIES, AVAILABILITY_OPTIONS, CONTRACT_EXPERTISE_OPTIONS, LANGUAGES
} from '../../config/constants';
import './onboarding.css';

const STEPS = [
  'Professional Profile',
  'Expertise & Specialization',
  'Availability & Retainer',
  'Verification',
];

interface LawyerFormData {
  title: string;
  yearsExperience: string;
  jurisdictions: string[];
  practiceAreas: string[];
  industries: string[];
  contractExpertise: string[];
  languages: string[];
  about: string;
  availability: string;
  retainerMin: string;
  retainerMax: string;
  currency: string;
  monthlyCapacity: string;
}

const INITIAL_FORM: LawyerFormData = {
  title: '', yearsExperience: '', jurisdictions: [],
  practiceAreas: [], industries: [], contractExpertise: [],
  languages: ['English'], about: '', availability: 'Immediate',
  retainerMin: '', retainerMax: '', currency: 'INR', monthlyCapacity: '',
};

export default function LawyerOnboardingPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LawyerFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof LawyerFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await lawyerService.getProfile();
        if (profile.onboardingDone) { navigate('/lawyer/overview'); return; }
        setStep(profile.onboardingStep || 0);
        setForm(f => ({
          ...f,
          title: profile.title || '',
          yearsExperience: profile.yearsExperience?.toString() || '',
          jurisdictions: profile.jurisdictions || [],
          practiceAreas: profile.practiceAreas || [],
          industries: profile.industries || [],
          contractExpertise: profile.contractExpertise || [],
          languages: profile.languages?.length ? profile.languages : ['English'],
          about: profile.about || '',
          availability: profile.availability || 'Immediate',
          retainerMin: profile.retainerMin?.toString() || '',
          retainerMax: profile.retainerMax?.toString() || '',
          currency: profile.currency || 'INR',
          monthlyCapacity: profile.monthlyCapacity?.toString() || '',
        }));
      } catch { /* fresh start */ } finally { setIsLoading(false); }
    };
    load();
  }, [navigate]);

  const set = (field: keyof LawyerFormData, value: string | string[]) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  const toggle = (field: 'practiceAreas' | 'industries' | 'contractExpertise' | 'jurisdictions' | 'languages', item: string) => {
    const arr = form[field] as string[];
    set(field, arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const validateStep0 = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Professional title is required.';
    if (!form.yearsExperience || isNaN(Number(form.yearsExperience))) e.yearsExperience = 'Enter years of experience.';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.practiceAreas.length) e.practiceAreas = 'Select at least one practice area.';
    if (!form.jurisdictions.length) e.jurisdictions = 'Select at least one jurisdiction.';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!form.retainerMin || isNaN(Number(form.retainerMin))) e.retainerMin = 'Enter minimum retainer.';
    if (!form.retainerMax || isNaN(Number(form.retainerMax))) e.retainerMax = 'Enter maximum retainer.';
    if (Number(form.retainerMin) > Number(form.retainerMax)) e.retainerMax = 'Max must be ≥ min.';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async (nextStep: number, extraData: object = {}) => {
    setIsSaving(true);
    try {
      await lawyerService.updateProfile({
        title: form.title || undefined,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        jurisdictions: form.jurisdictions,
        practiceAreas: form.practiceAreas,
        industries: form.industries,
        contractExpertise: form.contractExpertise,
        languages: form.languages,
        about: form.about || undefined,
        availability: form.availability,
        retainerMin: form.retainerMin ? Number(form.retainerMin) : undefined,
        retainerMax: form.retainerMax ? Number(form.retainerMax) : undefined,
        currency: form.currency,
        monthlyCapacity: form.monthlyCapacity ? Number(form.monthlyCapacity) : undefined,
        onboardingStep: nextStep,
        ...extraData,
      } as any);
      setStep(nextStep);
    } catch (err: any) {
      setErrors({ title: err?.response?.data?.message || 'Save failed.' });
    } finally { setIsSaving(false); }
  };

  const finish = async () => {
    setIsSaving(true);
    try {
      await lawyerService.updateProfile({ onboardingDone: true } as any);
      await refreshUser();
      navigate('/lawyer/overview');
    } catch { navigate('/lawyer/overview'); } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="onboarding-loading"><div className="onboarding-spinner" /></div>;

  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <div className="onboarding-wordmark">Counselly</div>
      </header>

      <main className="onboarding-main">
        <div className="onboarding-card onboarding-card--lawyer">
          <div className="onboarding-progress">
            {STEPS.map((label, i) => (
              <div key={label} className={`progress-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="progress-dot">{i < step ? '✓' : i + 1}</div>
                <span className="progress-label">{label}</span>
                {i < STEPS.length - 1 && <div className="progress-line" />}
              </div>
            ))}
          </div>

          {/* Step 0 — Professional Profile */}
          {step === 0 && (
            <div className="onboarding-step">
              <h1>Your professional profile</h1>
              <p className="step-subtitle">Help startups understand your background and experience.</p>
              <div className="form-grid">
                <div className={`form-field form-field--full ${errors.title ? 'has-error' : ''}`}>
                  <label>Professional title *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Corporate & Commercial Counsel" />
                  {errors.title && <span className="field-error">{errors.title}</span>}
                </div>
                <div className={`form-field ${errors.yearsExperience ? 'has-error' : ''}`}>
                  <label>Years of experience *</label>
                  <input type="number" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} placeholder="e.g. 10" min="0" />
                  {errors.yearsExperience && <span className="field-error">{errors.yearsExperience}</span>}
                </div>
                <div className="form-field form-field--full">
                  <label>Languages</label>
                  <div className="chip-select">
                    {LANGUAGES.map(l => (
                      <button key={l} type="button" className={`chip ${form.languages.includes(l) ? 'chip--selected' : ''}`} onClick={() => toggle('languages', l)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="form-field form-field--full">
                  <label>About you</label>
                  <textarea value={form.about} onChange={e => set('about', e.target.value)} placeholder="Describe your background, expertise, and the kind of clients you work best with..." rows={4} />
                </div>
              </div>
              <div className="onboarding-actions">
                <button className="btn-onboarding-primary" onClick={() => validateStep0() && save(1)} disabled={isSaving}>{isSaving ? 'Saving…' : 'Continue →'}</button>
              </div>
            </div>
          )}

          {/* Step 1 — Expertise */}
          {step === 1 && (
            <div className="onboarding-step">
              <h1>Your areas of expertise</h1>
              <p className="step-subtitle">Select the practice areas and industries you specialise in.</p>
              <div className="form-grid">
                <div className={`form-field form-field--full ${errors.practiceAreas ? 'has-error' : ''}`}>
                  <label>Practice areas *</label>
                  <div className="chip-select">
                    {PRACTICE_AREAS.map(a => (
                      <button key={a} type="button" className={`chip ${form.practiceAreas.includes(a) ? 'chip--selected' : ''}`} onClick={() => toggle('practiceAreas', a)}>{a}</button>
                    ))}
                  </div>
                  {errors.practiceAreas && <span className="field-error">{errors.practiceAreas}</span>}
                </div>
                <div className={`form-field form-field--full ${errors.jurisdictions ? 'has-error' : ''}`}>
                  <label>Jurisdictions *</label>
                  <div className="chip-select">
                    {JURISDICTIONS.map(j => (
                      <button key={j} type="button" className={`chip ${form.jurisdictions.includes(j) ? 'chip--selected' : ''}`} onClick={() => toggle('jurisdictions', j)}>{j}</button>
                    ))}
                  </div>
                  {errors.jurisdictions && <span className="field-error">{errors.jurisdictions}</span>}
                </div>
                <div className="form-field form-field--full">
                  <label>Industry experience</label>
                  <div className="chip-select">
                    {INDUSTRIES.map(i => (
                      <button key={i} type="button" className={`chip ${form.industries.includes(i) ? 'chip--selected' : ''}`} onClick={() => toggle('industries', i)}>{i}</button>
                    ))}
                  </div>
                </div>
                <div className="form-field form-field--full">
                  <label>Contract expertise</label>
                  <div className="chip-select">
                    {CONTRACT_EXPERTISE_OPTIONS.map(c => (
                      <button key={c} type="button" className={`chip ${form.contractExpertise.includes(c) ? 'chip--selected' : ''}`} onClick={() => toggle('contractExpertise', c)}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="onboarding-actions">
                <button className="btn-onboarding-secondary" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-onboarding-primary" onClick={() => validateStep1() && save(2)} disabled={isSaving}>{isSaving ? 'Saving…' : 'Continue →'}</button>
              </div>
            </div>
          )}

          {/* Step 2 — Availability & Retainer */}
          {step === 2 && (
            <div className="onboarding-step">
              <h1>Availability & retainer</h1>
              <p className="step-subtitle">Set your availability and monthly retainer range for startup engagements.</p>
              <div className="form-grid">
                <div className="form-field">
                  <label>Availability</label>
                  <select value={form.availability} onChange={e => set('availability', e.target.value)}>
                    {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Currency</label>
                  <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className={`form-field ${errors.retainerMin ? 'has-error' : ''}`}>
                  <label>Minimum monthly retainer *</label>
                  <input type="number" value={form.retainerMin} onChange={e => set('retainerMin', e.target.value)} placeholder="e.g. 80000" min="0" />
                  {errors.retainerMin && <span className="field-error">{errors.retainerMin}</span>}
                </div>
                <div className={`form-field ${errors.retainerMax ? 'has-error' : ''}`}>
                  <label>Maximum monthly retainer *</label>
                  <input type="number" value={form.retainerMax} onChange={e => set('retainerMax', e.target.value)} placeholder="e.g. 150000" min="0" />
                  {errors.retainerMax && <span className="field-error">{errors.retainerMax}</span>}
                </div>
                <div className="form-field">
                  <label>Monthly capacity (hours)</label>
                  <input type="number" value={form.monthlyCapacity} onChange={e => set('monthlyCapacity', e.target.value)} placeholder="e.g. 40" min="1" />
                </div>
              </div>
              <div className="onboarding-actions">
                <button className="btn-onboarding-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-onboarding-primary" onClick={() => validateStep2() && save(3)} disabled={isSaving}>{isSaving ? 'Saving…' : 'Continue →'}</button>
              </div>
            </div>
          )}

          {/* Step 3 — Verification placeholder */}
          {step === 3 && (
            <div className="onboarding-step onboarding-step--review">
              <div className="verification-badge">
                <div className="verification-icon">⏳</div>
                <span>Verification Pending</span>
              </div>
              <h1>Profile submitted</h1>
              <p className="step-subtitle">
                Your professional profile has been received. Verification of your credentials
                and bar enrollment will be completed in the next stage of the platform rollout.
              </p>
              <p className="step-note">
                You can access your dashboard and view incoming requests while verification is in progress.
              </p>
              <div className="onboarding-actions">
                <button className="btn-onboarding-primary" onClick={finish} disabled={isSaving}>
                  {isSaving ? 'Setting up…' : 'Go to Dashboard →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
