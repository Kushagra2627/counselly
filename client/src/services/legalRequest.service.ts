import { insforge } from './insforge';

export interface LegalRequest {
  id: string;
  title: string;
  matterType: string;
  description: string;
  industry: string;
  jurisdiction: string;
  requiredExpertise: string[];
  budgetMin: number;
  budgetMax: number;
  currency: string;
  expectedHours: number;
  urgency: string;
  availability: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

export interface CreateLegalRequestData {
  title: string;
  matterType: string;
  description: string;
  industry: string;
  jurisdiction: string;
  requiredExpertise: string[];
  budgetMin: number;
  budgetMax: number;
  currency: string;
  expectedHours: number;
  urgency: string;
  availability: string;
}

const mapRequestRow = (row: any): LegalRequest => ({
  id: row.id,
  title: row.title,
  matterType: row.matter_type,
  description: row.description,
  industry: row.industry,
  jurisdiction: row.jurisdiction,
  requiredExpertise: row.required_expertise || [],
  budgetMin: row.budget_min,
  budgetMax: row.budget_max,
  currency: row.currency || 'INR',
  expectedHours: row.expected_hours,
  urgency: row.urgency,
  availability: row.availability,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  submittedAt: row.submitted_at,
});

export const legalRequestService = {
  getRequests: async (): Promise<LegalRequest[]> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const { data: startup } = await insforge.database
      .from('startups')
      .select('id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!startup) return [];

    const { data, error } = await insforge.database
      .from('legal_requests')
      .select('*')
      .eq('startup_id', startup.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(mapRequestRow);
  },

  getPublicRequests: async (): Promise<{ requests: LegalRequest[] }> => {
    const { data, error } = await insforge.database
      .from('legal_requests')
      .select('*')
      .neq('status', 'DRAFT')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { requests: (data || []).map(mapRequestRow) };
  },

  createRequest: async (data: CreateLegalRequestData): Promise<LegalRequest> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    let { data: startup } = await insforge.database
      .from('startups')
      .select('id')
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

    if (!startup) {
      throw new Error('Startup profile could not be found or initialized');
    }

    const { data: inserted, error } = await insforge.database
      .from('legal_requests')
      .insert([{
        startup_id: startup.id,
        title: data.title,
        matter_type: data.matterType,
        description: data.description,
        industry: data.industry,
        jurisdiction: data.jurisdiction,
        required_expertise: data.requiredExpertise,
        budget_min: Number(data.budgetMin),
        budget_max: Number(data.budgetMax),
        currency: data.currency || 'INR',
        expected_hours: Number(data.expectedHours),
        urgency: data.urgency,
        availability: data.availability,
        status: 'DRAFT',
      }])
      .select()
      .single();

    if (error || !inserted) throw new Error(error?.message || 'Failed to create legal request');
    return mapRequestRow(inserted);
  },

  getRequest: async (id: string): Promise<LegalRequest> => {
    const { data, error } = await insforge.database
      .from('legal_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error(error?.message || 'Legal request not found');
    return mapRequestRow(data);
  },

  updateRequest: async (id: string, data: Partial<CreateLegalRequestData>): Promise<LegalRequest> => {
    const updatePayload: Record<string, any> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.matterType !== undefined) updatePayload.matter_type = data.matterType;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.industry !== undefined) updatePayload.industry = data.industry;
    if (data.jurisdiction !== undefined) updatePayload.jurisdiction = data.jurisdiction;
    if (data.requiredExpertise !== undefined) updatePayload.required_expertise = data.requiredExpertise;
    if (data.budgetMin !== undefined) updatePayload.budget_min = Number(data.budgetMin);
    if (data.budgetMax !== undefined) updatePayload.budget_max = Number(data.budgetMax);
    if (data.currency !== undefined) updatePayload.currency = data.currency;
    if (data.expectedHours !== undefined) updatePayload.expected_hours = Number(data.expectedHours);
    if (data.urgency !== undefined) updatePayload.urgency = data.urgency;
    if (data.availability !== undefined) updatePayload.availability = data.availability;

    const { data: updated, error } = await insforge.database
      .from('legal_requests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) throw new Error(error?.message || 'Failed to update legal request');
    return mapRequestRow(updated);
  },

  submitRequest: async (id: string): Promise<LegalRequest> => {
    // 1. Update status to SUBMITTED
    const { data: updated, error } = await insforge.database
      .from('legal_requests')
      .update({
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) throw new Error(error?.message || 'Failed to submit legal request');

    // 2. Run matching engine on InsForge via RPC!
    try {
      await insforge.database.rpc('run_matching', { p_request_id: id });
    } catch (rpcErr) {
      console.warn('RPC matching warning:', rpcErr);
    }

    // Return the latest record
    return legalRequestService.getRequest(id);
  },

  deleteRequest: async (id: string): Promise<void> => {
    const { error } = await insforge.database
      .from('legal_requests')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};
