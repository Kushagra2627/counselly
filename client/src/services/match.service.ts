import { insforge } from './insforge';
import type { LawyerProfile } from './lawyer.service';
import type { LegalRequest } from './legalRequest.service';

export interface Match {
  id: string;
  legalRequestId: string;
  lawyerId: string;
  startupId: string;
  matchReasons: string[];
  status: string;
  createdAt: string;
  lawyer: LawyerProfile & { user: { name: string; email: string } };
  legalRequest?: LegalRequest;
  startup?: { companyName: string | null; user: { name: string } };
}

export const matchService = {
  getMatchesForRequest: async (requestId: string): Promise<Match[]> => {
    const { data: matches, error } = await insforge.database
      .from('matches')
      .select('*')
      .eq('legal_request_id', requestId);

    if (error) throw new Error(error.message);
    if (!matches || matches.length === 0) return [];

    // Fetch lawyer details
    const lawyerIds = matches.map(m => m.lawyer_id);
    const { data: lawyers } = await insforge.database
      .from('lawyers')
      .select('*')
      .in('id', lawyerIds);

    const lawyerMap = new Map((lawyers || []).map(l => [l.id, l]));

    return matches.map(m => {
      const l = lawyerMap.get(m.lawyer_id) || {};
      return {
        id: m.id,
        legalRequestId: m.legal_request_id,
        lawyerId: m.lawyer_id,
        startupId: m.startup_id,
        matchReasons: m.match_reasons || [],
        status: m.status,
        createdAt: m.created_at,
        lawyer: {
          id: l.id || m.lawyer_id,
          title: l.title || 'Legal Counsel',
          yearsExperience: l.years_experience ?? 0,
          jurisdictions: l.jurisdictions || [],
          practiceAreas: l.practice_areas || [],
          industries: l.industries || [],
          contractExpertise: l.contract_expertise || [],
          languages: l.languages || [],
          about: l.about || '',
          availability: l.availability || 'Immediate',
          retainerMin: l.retainer_min ?? null,
          retainerMax: l.retainer_max ?? null,
          currency: l.currency || 'INR',
          monthlyCapacity: l.monthly_capacity ?? 5,
          verificationStatus: l.verification_status || 'PENDING',
          onboardingStep: l.onboarding_step ?? 4,
          onboardingDone: l.onboarding_done ?? true,
          isDemo: l.is_demo ?? false,
          user: {
            id: l.user_id || l.id,
            name: l.name || 'Counsel',
            email: l.email || 'counsel@demo.counselly.internal',
          },
        },
      };
    });
  },

  getMatchesForLawyer: async (): Promise<Match[]> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const { data: lawyer } = await insforge.database
      .from('lawyers')
      .select('id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!lawyer) return [];

    const { data: matches, error } = await insforge.database
      .from('matches')
      .select('*')
      .eq('lawyer_id', lawyer.id);

    if (error) throw new Error(error.message);
    if (!matches || matches.length === 0) return [];

    const requestIds = matches.map(m => m.legal_request_id);
    const { data: requests } = await insforge.database
      .from('legal_requests')
      .select('*')
      .in('id', requestIds);

    const startupIds = matches.map(m => m.startup_id);
    const { data: startups } = await insforge.database
      .from('startups')
      .select('*, profiles:user_id(name)')
      .in('id', startupIds);

    const reqMap = new Map((requests || []).map(r => [r.id, r]));
    const startupMap = new Map((startups || []).map(s => [s.id, s]));

    return matches.map(m => {
      const r = reqMap.get(m.legal_request_id) || {};
      const s = startupMap.get(m.startup_id) || {};

      return {
        id: m.id,
        legalRequestId: m.legal_request_id,
        lawyerId: m.lawyer_id,
        startupId: m.startup_id,
        matchReasons: m.match_reasons || [],
        status: m.status,
        createdAt: m.created_at,
        lawyer: {
          id: lawyer.id,
          title: 'Legal Counsel',
          yearsExperience: 0,
          jurisdictions: [],
          practiceAreas: [],
          industries: [],
          contractExpertise: [],
          languages: [],
          about: null,
          availability: null,
          retainerMin: null,
          retainerMax: null,
          currency: 'INR',
          monthlyCapacity: null,
          verificationStatus: 'PENDING',
          onboardingStep: 0,
          onboardingDone: false,
          isDemo: false,
          user: { 
            id: authData.user?.id || lawyer.id, 
            name: (authData.user?.profile as any)?.name || 'Legal Counsel', 
            email: authData.user?.email || 'counsel@counselly.internal' 
          },
        },
        legalRequest: {
          id: r.id || m.legal_request_id,
          title: r.title || 'Legal Requirement',
          matterType: r.matter_type || 'General Counsel Support',
          description: r.description || '',
          industry: r.industry || 'Technology',
          jurisdiction: r.jurisdiction || 'India',
          requiredExpertise: r.required_expertise || [],
          budgetMin: r.budget_min || 0,
          budgetMax: r.budget_max || 0,
          currency: r.currency || 'INR',
          expectedHours: r.expected_hours || 10,
          urgency: r.urgency || 'MEDIUM',
          availability: r.availability || 'Immediate',
          status: r.status || 'SUBMITTED',
          createdAt: r.created_at || m.created_at,
          updatedAt: r.updated_at || m.created_at,
          submittedAt: r.submitted_at || null,
        },
        startup: {
          companyName: s.company_name || 'Startup Client',
          user: { name: (s as any)?.profiles?.name || 'Founder' },
        },
      };
    });
  },

  getLawyerMatches: async (): Promise<{ matches: Match[] }> => {
    const matches = await matchService.getMatchesForLawyer();
    return { matches };
  },

  respondToMatch: async (matchId: string, action: 'ACCEPTED' | 'DECLINED'): Promise<Match> => {
    const { data: updated, error } = await insforge.database
      .from('matches')
      .update({ status: action })
      .eq('id', matchId)
      .select()
      .single();

    if (error || !updated) throw new Error(error?.message || 'Failed to update match status');
    return updated as any;
  },

  updateMatchStatus: async (matchId: string, action: 'ACCEPTED' | 'DECLINED'): Promise<Match> => {
    return matchService.respondToMatch(matchId, action);
  },
};
