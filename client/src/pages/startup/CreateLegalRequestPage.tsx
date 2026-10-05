import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { legalRequestService } from '../../services/legalRequest.service';
import {
  MATTER_TYPES, INDUSTRIES, JURISDICTIONS, SUPPORTED_CURRENCIES,
  PRACTICE_AREAS, AVAILABILITY_OPTIONS, URGENCY_LABELS
} from '../../config/constants';
import '../dashboard.css';

export default function CreateLegalRequestPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', matterType: '', description: '', industry: '', jurisdiction: '',
    requiredExpertise: [] as string[], budgetMin: '', budgetMax: '',
    currency: 'INR', expectedHours: '', urgency: 'MEDIUM', availability: 'Within 2 weeks',
  });

  const set = (field: string, value: string | string[]) =>
    setForm(f => ({ ...f, [field]: value }));

  const toggleExpertise = (item: string) =>
    set('requiredExpertise', form.requiredExpertise.includes(item)
      ? form.requiredExpertise.filter(e => e !== item)
      : [...form.requiredExpertise, item]);

  const handleSubmit = async (e: FormEvent, submit = false) => {
    e.preventDefault();
    if (!form.title.trim() || !form.matterType || !form.description.trim() || !form.jurisdiction || !form.budgetMin || !form.budgetMax) {
      setError('Please fill in all required fields.');
      return;
    }
    if (Number(form.budgetMin) > Number(form.budgetMax)) {
      setError('Maximum budget must be ≥ minimum budget.');
      return;
    }
    setError(''); setIsLoading(true);
    try {
      const req = await legalRequestService.createRequest({
        title: form.title,
        matterType: form.matterType,
        description: form.description,
        industry: form.industry,
        jurisdiction: form.jurisdiction,
        requiredExpertise: form.requiredExpertise,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        currency: form.currency,
        expectedHours: Number(form.expectedHours) || 20,
        urgency: form.urgency,
        availability: form.availability,
      });
      if (submit) {
        await legalRequestService.submitRequest(req.id);
      }
      navigate(`/startup/requests/${req.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create request. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <Link to="/startup/requests" className="back-link">← Legal Requests</Link>
          <h1>New Legal Request</h1>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form className="request-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid-2">
            <div className="form-field form-field--full">
              <label>Request title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. SaaS Agreement Review and Drafting" />
            </div>
            <div className="form-field">
              <label>Matter type *</label>
              <select value={form.matterType} onChange={e => set('matterType', e.target.value)}>
                <option value="">Select matter type</option>
                {MATTER_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Industry</label>
              <select value={form.industry} onChange={e => set('industry', e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-field form-field--full">
              <label>Description *</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your legal need in detail — the more specific, the better the match." rows={5} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Jurisdiction & Expertise</h3>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Jurisdiction *</label>
              <select value={form.jurisdiction} onChange={e => set('jurisdiction', e.target.value)}>
                <option value="">Select jurisdiction</option>
                {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="form-field form-field--full">
              <label>Required expertise areas</label>
              <div className="chip-select">
                {PRACTICE_AREAS.map(a => (
                  <button key={a} type="button" className={`chip ${form.requiredExpertise.includes(a) ? 'chip--selected' : ''}`} onClick={() => toggleExpertise(a)}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Budget & Timeline</h3>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Expected hours / month</label>
              <input type="number" value={form.expectedHours} onChange={e => set('expectedHours', e.target.value)} placeholder="20" min="1" />
            </div>
            <div className="form-field">
              <label>Monthly budget min *</label>
              <input type="number" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} placeholder="e.g. 50000" min="0" />
            </div>
            <div className="form-field">
              <label>Monthly budget max *</label>
              <input type="number" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} placeholder="e.g. 100000" min="0" />
            </div>
            <div className="form-field">
              <label>Urgency</label>
              <select value={form.urgency} onChange={e => set('urgency', e.target.value)}>
                {Object.entries(URGENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Availability required</label>
              <select value={form.availability} onChange={e => set('availability', e.target.value)}>
                {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={e => handleSubmit(e, false)} disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Save as Draft'}
          </button>
          <button type="button" className="btn-primary" onClick={e => handleSubmit(e, true)} disabled={isLoading}>
            {isLoading ? 'Submitting…' : 'Save & Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
