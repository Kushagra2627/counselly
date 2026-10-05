import { insforge } from './insforge';

export interface StartupProfile {
  id: string;
  companyName: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  country: string | null;
  jurisdiction: string | null;
  description: string | null;
  onboardingStep: number;
  onboardingDone: boolean;
  verificationStatus: string;
  user: { id: string; name: string; email: string };
}

export interface StartupOverview {
  totalRequests: number;
  draftRequests: number;
  activeRequests: number;
  totalMatches: number;
}

export const startupService = {
  getProfile: async (): Promise<StartupProfile> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    let { data: startup } = await insforge.database
      .from('startups')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!startup) {
      const { data: created } = await insforge.database
        .from('startups')
        .insert([{ user_id: authData.user.id }])
        .select()
        .single();
      startup = created;
    }

    const { data: profile } = await insforge.database
      .from('profiles')
      .select('name, email')
      .eq('id', authData.user.id)
      .maybeSingle();

    return {
      id: startup.id,
      companyName: startup.company_name,
      website: startup.website,
      industry: startup.industry,
      companySize: startup.company_size,
      country: startup.country,
      jurisdiction: startup.jurisdiction,
      description: startup.description,
      onboardingStep: startup.onboarding_step ?? 0,
      onboardingDone: startup.onboarding_done ?? false,
      verificationStatus: startup.verification_status || 'PENDING',
      user: {
        id: authData.user.id,
        name: profile?.name || (authData.user.profile as any)?.name || 'Startup Founder',
        email: profile?.email || authData.user.email,
      },
    };
  },

  updateProfile: async (data: Partial<StartupProfile>): Promise<StartupProfile> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const updatePayload: Record<string, any> = {};
    if (data.companyName !== undefined) updatePayload.company_name = data.companyName;
    if (data.website !== undefined) updatePayload.website = data.website;
    if (data.industry !== undefined) updatePayload.industry = data.industry;
    if (data.companySize !== undefined) updatePayload.company_size = data.companySize;
    if (data.country !== undefined) updatePayload.country = data.country;
    if (data.jurisdiction !== undefined) updatePayload.jurisdiction = data.jurisdiction;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.onboardingStep !== undefined) updatePayload.onboarding_step = data.onboardingStep;
    if (data.onboardingDone !== undefined) updatePayload.onboarding_done = data.onboardingDone;

    const { error } = await insforge.database
      .from('startups')
      .update(updatePayload)
      .eq('user_id', authData.user.id);

    if (error) throw new Error(error.message);

    return startupService.getProfile();
  },

  getOverview: async (): Promise<StartupOverview> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const { data: startup } = await insforge.database
      .from('startups')
      .select('id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!startup) {
      return { totalRequests: 0, draftRequests: 0, activeRequests: 0, totalMatches: 0 };
    }

    const { data: requests } = await insforge.database
      .from('legal_requests')
      .select('id, status')
      .eq('startup_id', startup.id);

    const { data: matches } = await insforge.database
      .from('matches')
      .select('id')
      .eq('startup_id', startup.id);

    const allRequests = requests || [];
    const draftCount = allRequests.filter(r => r.status === 'DRAFT').length;
    const activeCount = allRequests.filter(r => r.status !== 'DRAFT' && r.status !== 'COMPLETED').length;

    return {
      totalRequests: allRequests.length,
      draftRequests: draftCount,
      activeRequests: activeCount,
      totalMatches: matches?.length || 0,
    };
  },
};
