export const PRACTICE_AREAS = [
  'Corporate', 'Commercial Contracts', 'SaaS & Technology',
  'Employment & HR', 'Intellectual Property', 'Privacy & Data Protection',
  'Regulatory & Compliance', 'Mergers & Acquisitions', 'Venture Capital',
  'Real Estate', 'Dispute Resolution', 'International Trade'
] as const;

export const INDUSTRIES = [
  'Technology', 'SaaS', 'Fintech', 'Healthcare', 'E-Commerce',
  'Manufacturing', 'Media & Entertainment', 'Real Estate',
  'Education', 'Logistics', 'Energy', 'Consumer Goods'
] as const;

export const JURISDICTIONS = [
  'India', 'United States', 'United Kingdom', 'European Union',
  'Singapore', 'UAE', 'Australia', 'Canada', 'Germany', 'France'
] as const;

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'GBP', 'EUR'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹', USD: '$', GBP: '£', EUR: '€'
};

export const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '500+ employees'
] as const;

export const AVAILABILITY_OPTIONS = [
  'Immediate', 'Within 1 week', 'Within 2 weeks', 'Within 1 month'
] as const;

export const MATTER_TYPES = [
  'Contract Drafting & Review', 'Corporate Structuring', 'Employment Matters',
  'IP Registration & Protection', 'Regulatory Compliance', 'Privacy & GDPR',
  'SaaS Agreements', 'Vendor Agreements', 'M&A Advisory',
  'Dispute Resolution', 'Fundraising & VC', 'General Counsel Support'
] as const;

export const URGENCY_LABELS: Record<string, string> = {
  LOW: 'Low — within 30 days',
  MEDIUM: 'Medium — within 2 weeks',
  HIGH: 'High — within 1 week',
  URGENT: 'Urgent — within 48 hours'
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  MATCHING: 'Finding Matches',
  MATCHED: 'Matched',
  LAWYER_SELECTED: 'Counsel Selected',
  ENGAGEMENT_ACTIVE: 'Engagement Active',
  COMPLETED: 'Completed'
};

export const MATCH_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  ENGAGED: 'Engaged'
};

export const CONTRACT_EXPERTISE_OPTIONS = [
  'SaaS Agreements', 'Master Service Agreements', 'NDAs',
  'Employment Contracts', 'Founder Agreements', 'Share Purchase Agreements',
  'Term Sheets', 'Licensing Agreements', 'Distribution Agreements',
  'Partnership Agreements'
] as const;

export const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi',
  'French', 'German', 'Spanish', 'Mandarin', 'Arabic'
] as const;

export const STARTUP_NAV_ITEMS = [
  { label: 'Overview', path: '/startup/overview', icon: 'grid' },
  { label: 'Legal Requests', path: '/startup/requests', icon: 'file-text' },
  { label: 'Matched Counsel', path: '/startup/counsel', icon: 'users' },
  { label: 'Company Profile', path: '/startup/profile', icon: 'building' },
  { label: 'Verification', path: '/startup/verification', icon: 'shield' },
  { label: 'Settings', path: '/startup/settings', icon: 'settings' },
] as const;

export const LAWYER_NAV_ITEMS = [
  { label: 'Overview', path: '/lawyer/overview', icon: 'grid' },
  { label: 'Incoming Requests', path: '/lawyer/requests', icon: 'inbox' },
  { label: 'My Matches', path: '/lawyer/matches', icon: 'users' },
  { label: 'Professional Profile', path: '/lawyer/profile', icon: 'user' },
  { label: 'Verification', path: '/lawyer/verification', icon: 'shield' },
  { label: 'Settings', path: '/lawyer/settings', icon: 'settings' },
];

export const ADMIN_NAV_ITEMS = [
  { label: 'Verification Queue', path: '/admin/verification', icon: 'shield' },
];
