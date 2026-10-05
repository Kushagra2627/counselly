import { insforge } from './insforge';

export interface LawyerProfile {
  id: string;
  title: string | null;
  yearsExperience: number | null;
  jurisdictions: string[];
  practiceAreas: string[];
  industries: string[];
  contractExpertise: string[];
  languages: string[];
  about: string | null;
  availability: string | null;
  retainerMin: number | null;
  retainerMax: number | null;
  currency: string | null;
  monthlyCapacity: number | null;
  verificationStatus: string;
  onboardingStep: number;
  onboardingDone: boolean;
  isDemo: boolean;
  user?: { id: string; name: string; email: string };
}

export interface LawyerFilters {
  practiceArea?: string;
  jurisdiction?: string;
  availability?: string;
  currency?: string;
  retainerMin?: number;
  retainerMax?: number;
}

export interface LawyerOverview {
  newMatches: number;
  activeEngagements: number;
  totalClients: number;
  pendingActions: number;
}

const mapLawyerRow = (row: any): LawyerProfile => ({
  id: row.id,
  title: row.title,
  yearsExperience: row.years_experience,
  jurisdictions: row.jurisdictions || [],
  practiceAreas: row.practice_areas || [],
  industries: row.industries || [],
  contractExpertise: row.contract_expertise || [],
  languages: row.languages || [],
  about: row.about,
  availability: row.availability,
  retainerMin: row.retainer_min,
  retainerMax: row.retainer_max,
  currency: row.currency || 'INR',
  monthlyCapacity: row.monthly_capacity,
  verificationStatus: row.verification_status || 'PENDING',
  onboardingStep: row.onboarding_step ?? 0,
  onboardingDone: row.onboarding_done ?? false,
  isDemo: row.is_demo ?? false,
  user: {
    id: row.user_id || row.id,
    name: row.name || 'Counsel',
    email: row.email || 'counsel@counselly.internal',
  },
});

export const lawyerService = {
  getProfile: async (): Promise<LawyerProfile> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    let { data: lawyer } = await insforge.database
      .from('lawyers')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!lawyer) {
      const { data: created } = await insforge.database
        .from('lawyers')
        .insert([{
          user_id: authData.user.id,
          name: (authData.user.profile as any)?.name || authData.user.email.split('@')[0],
          email: authData.user.email,
        }])
        .select()
        .single();
      lawyer = created;
    }

    return mapLawyerRow(lawyer);
  },

  updateProfile: async (data: Partial<LawyerProfile>): Promise<LawyerProfile> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const updatePayload: Record<string, any> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.yearsExperience !== undefined) updatePayload.years_experience = data.yearsExperience;
    if (data.jurisdictions !== undefined) updatePayload.jurisdictions = data.jurisdictions;
    if (data.practiceAreas !== undefined) updatePayload.practice_areas = data.practiceAreas;
    if (data.industries !== undefined) updatePayload.industries = data.industries;
    if (data.contractExpertise !== undefined) updatePayload.contract_expertise = data.contractExpertise;
    if (data.languages !== undefined) updatePayload.languages = data.languages;
    if (data.about !== undefined) updatePayload.about = data.about;
    if (data.availability !== undefined) updatePayload.availability = data.availability;
    if (data.retainerMin !== undefined) updatePayload.retainer_min = data.retainerMin;
    if (data.retainerMax !== undefined) updatePayload.retainer_max = data.retainerMax;
    if (data.currency !== undefined) updatePayload.currency = data.currency;
    if (data.monthlyCapacity !== undefined) updatePayload.monthly_capacity = data.monthlyCapacity;
    if (data.onboardingStep !== undefined) updatePayload.onboarding_step = data.onboardingStep;
    if (data.onboardingDone !== undefined) updatePayload.onboarding_done = data.onboardingDone;

    const { error } = await insforge.database
      .from('lawyers')
      .update(updatePayload)
      .eq('user_id', authData.user.id);

    if (error) throw new Error(error.message);

    return lawyerService.getProfile();
  },

  getOverview: async (): Promise<LawyerOverview> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const { data: lawyer } = await insforge.database
      .from('lawyers')
      .select('id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!lawyer) {
      return { newMatches: 0, activeEngagements: 0, totalClients: 0, pendingActions: 0 };
    }

    const { data: matches } = await insforge.database
      .from('matches')
      .select('id, status')
      .eq('lawyer_id', lawyer.id);

    const allMatches = matches || [];
    const pendingCount = allMatches.filter(m => m.status === 'PENDING').length;
    const acceptedCount = allMatches.filter(m => m.status === 'ACCEPTED' || m.status === 'ENGAGED').length;

    return {
      newMatches: pendingCount,
      activeEngagements: acceptedCount,
      totalClients: acceptedCount,
      pendingActions: pendingCount,
    };
  },

  getLawyers: async (filters?: LawyerFilters): Promise<LawyerProfile[]> => {
    let query = insforge.database.from('lawyers').select('*');

    if (filters?.currency) {
      query = query.eq('currency', filters.currency);
    }
    if (filters?.availability) {
      query = query.eq('availability', filters.availability);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let results = (data || []).map(mapLawyerRow);

    if (filters?.practiceArea) {
      results = results.filter(l => l.practiceAreas.includes(filters.practiceArea!));
    }
    if (filters?.jurisdiction) {
      results = results.filter(l => l.jurisdictions.includes(filters.jurisdiction!));
    }
    if (filters?.retainerMin) {
      results = results.filter(l => (l.retainerMin ?? 0) >= filters.retainerMin!);
    }
    if (filters?.retainerMax) {
      results = results.filter(l => (l.retainerMax ?? 999999999) <= filters.retainerMax!);
    }

    return results;
  },

  getLawyerById: async (id: string): Promise<LawyerProfile> => {
    const { data, error } = await insforge.database
      .from('lawyers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error(error?.message || 'Lawyer not found');
    return mapLawyerRow(data);
  },
};
