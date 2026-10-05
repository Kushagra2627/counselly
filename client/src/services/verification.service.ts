import { insforge } from './insforge';

// ── Types ──────────────────────────────────────────────────────────────────

export type VerificationStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface LawyerVerificationStatus {
  verificationStatus: VerificationStatus;
  verificationSubmittedAt: string | null;
  verificationReviewedAt: string | null;
  verificationRejectionReason: string | null;
}

export interface StartupVerificationStatus {
  verificationStatus: VerificationStatus;
  verificationSubmittedAt: string | null;
  verificationReviewedAt: string | null;
  verificationRejectionReason: string | null;
}

export interface LawyerVerificationSubmission {
  barNumber: string;
  licensingBody: string;
  professionalEmail?: string;
  linkedinUrl?: string;
  additionalNotes?: string;
}

export interface StartupVerificationSubmission {
  companyLegalName: string;
  businessRegistrationNumber: string;
  companyWebsite?: string;
  authorizedRepresentative: string;
  representativeDesignation?: string;
}

export interface VerificationSubmissionRecord {
  id: string;
  entityType: 'LAWYER' | 'STARTUP';
  entityId: string;
  userId: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  // Lawyer fields
  barNumber?: string;
  licensingBody?: string;
  professionalEmail?: string;
  linkedinUrl?: string;
  additionalNotes?: string;
  // Startup fields
  companyLegalName?: string;
  businessRegistrationNumber?: string;
  companyWebsite?: string;
  authorizedRepresentative?: string;
  representativeDesignation?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const mapSubmissionRow = (row: any): VerificationSubmissionRecord => ({
  id: row.id,
  entityType: row.entity_type,
  entityId: row.entity_id,
  userId: row.user_id,
  status: row.status,
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at,
  reviewedBy: row.reviewed_by,
  rejectionReason: row.rejection_reason,
  barNumber: row.bar_number,
  licensingBody: row.licensing_body,
  professionalEmail: row.professional_email,
  linkedinUrl: row.linkedin_url,
  additionalNotes: row.additional_notes,
  companyLegalName: row.company_legal_name,
  businessRegistrationNumber: row.business_registration_number,
  companyWebsite: row.company_website,
  authorizedRepresentative: row.authorized_representative,
  representativeDesignation: row.representative_designation,
});

// ── Service ────────────────────────────────────────────────────────────────

export const verificationService = {
  // ── Lawyer ──────────────────────────────────────────────────────────────

  getLawyerVerificationStatus: async (): Promise<LawyerVerificationStatus> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const { data: lawyer, error } = await insforge.database
      .from('lawyers')
      .select('verification_status, verification_submitted_at, verification_reviewed_at, verification_rejection_reason')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!lawyer) throw new Error('Lawyer profile not found');

    return {
      verificationStatus: (lawyer.verification_status as VerificationStatus) || 'PENDING',
      verificationSubmittedAt: lawyer.verification_submitted_at || null,
      verificationReviewedAt: lawyer.verification_reviewed_at || null,
      verificationRejectionReason: lawyer.verification_rejection_reason || null,
    };
  },

  submitLawyerVerification: async (
    lawyerId: string,
    submission: LawyerVerificationSubmission,
  ): Promise<void> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    // Insert verification submission record
    const { error: submissionError } = await insforge.database
      .from('verification_submissions')
      .insert([{
        entity_type: 'LAWYER',
        entity_id: lawyerId,
        user_id: authData.user.id,
        bar_number: submission.barNumber,
        licensing_body: submission.licensingBody,
        professional_email: submission.professionalEmail || null,
        linkedin_url: submission.linkedinUrl || null,
        additional_notes: submission.additionalNotes || null,
        status: 'SUBMITTED',
      }]);

    if (submissionError) throw new Error(submissionError.message);

    // Update lawyer verification_status + submitted_at
    const { error: updateError } = await insforge.database
      .from('lawyers')
      .update({
        verification_status: 'SUBMITTED',
        verification_submitted_at: new Date().toISOString(),
      })
      .eq('user_id', authData.user.id);

    if (updateError) throw new Error(updateError.message);
  },

  // ── Startup ─────────────────────────────────────────────────────────────

  getStartupVerificationStatus: async (): Promise<StartupVerificationStatus> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const { data: startup, error } = await insforge.database
      .from('startups')
      .select('verification_status, verification_submitted_at, verification_reviewed_at, verification_rejection_reason')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!startup) throw new Error('Startup profile not found');

    return {
      verificationStatus: (startup.verification_status as VerificationStatus) || 'PENDING',
      verificationSubmittedAt: startup.verification_submitted_at || null,
      verificationReviewedAt: startup.verification_reviewed_at || null,
      verificationRejectionReason: startup.verification_rejection_reason || null,
    };
  },

  submitStartupVerification: async (
    startupId: string,
    submission: StartupVerificationSubmission,
  ): Promise<void> => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    if (!authData?.user) throw new Error('Not authenticated');

    const { error: submissionError } = await insforge.database
      .from('verification_submissions')
      .insert([{
        entity_type: 'STARTUP',
        entity_id: startupId,
        user_id: authData.user.id,
        company_legal_name: submission.companyLegalName,
        business_registration_number: submission.businessRegistrationNumber,
        company_website: submission.companyWebsite || null,
        authorized_representative: submission.authorizedRepresentative,
        representative_designation: submission.representativeDesignation || null,
        status: 'SUBMITTED',
      }]);

    if (submissionError) throw new Error(submissionError.message);

    const { error: updateError } = await insforge.database
      .from('startups')
      .update({
        verification_status: 'SUBMITTED',
        verification_submitted_at: new Date().toISOString(),
      })
      .eq('user_id', authData.user.id);

    if (updateError) throw new Error(updateError.message);
  },

  // ── Admin ────────────────────────────────────────────────────────────────

  /**
   * Admin: list all verification submissions by status.
   * Calls the admin_list_verifications RPC which checks the caller is ADMIN server-side.
   */
  adminListVerifications: async (
    status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'ALL' = 'SUBMITTED',
  ): Promise<VerificationSubmissionRecord[]> => {
    const { data, error } = await insforge.database.rpc('admin_list_verifications', {
      p_status: status,
    });

    if (error) throw new Error(error.message);
    const result = data as any;
    if (!result?.success) throw new Error(result?.error || 'Failed to list verifications');

    return ((result.data as any[]) || []).map(mapSubmissionRow);
  },

  /**
   * Admin: approve or reject a LAWYER verification.
   * The RPC runs SECURITY DEFINER and checks the caller is ADMIN.
   */
  adminReviewLawyer: async (
    lawyerId: string,
    action: 'VERIFY' | 'REJECT',
    rejectionReason?: string,
  ): Promise<void> => {
    const { data, error } = await insforge.database.rpc('admin_review_lawyer', {
      p_lawyer_id: lawyerId,
      p_action: action,
      p_rejection_reason: rejectionReason || null,
    });

    if (error) throw new Error(error.message);
    const result = data as any;
    if (!result?.success) throw new Error(result?.error || 'Review action failed');
  },

  /**
   * Admin: approve or reject a STARTUP verification.
   */
  adminReviewStartup: async (
    startupId: string,
    action: 'VERIFY' | 'REJECT',
    rejectionReason?: string,
  ): Promise<void> => {
    const { data, error } = await insforge.database.rpc('admin_review_startup', {
      p_startup_id: startupId,
      p_action: action,
      p_rejection_reason: rejectionReason || null,
    });

    if (error) throw new Error(error.message);
    const result = data as any;
    if (!result?.success) throw new Error(result?.error || 'Review action failed');
  },

  /**
   * Admin: get the pending submission detail for a given entity.
   * Fetches from verification_submissions + joined entity data.
   */
  adminGetSubmission: async (submissionId: string): Promise<VerificationSubmissionRecord | null> => {
    const { data, error } = await insforge.database
      .from('verification_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapSubmissionRow(data);
  },
};
