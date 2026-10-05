-- ====================================================================
-- Counselly Stage 3 Migration: Verification + Security Hardening
-- ====================================================================

-- 1. Add verification fields to startups table
ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED')),
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS verification_rejection_reason TEXT;

-- 2. Add audit fields to lawyers table (submitted_at, reviewed_at, reviewed_by, rejection_reason)
ALTER TABLE public.lawyers
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS verification_rejection_reason TEXT;

-- 3. Verification submissions table (lawyer submissions)
CREATE TABLE IF NOT EXISTS public.verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('LAWYER', 'STARTUP')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Lawyer-specific fields
  bar_number TEXT,
  licensing_body TEXT,
  professional_email TEXT,
  linkedin_url TEXT,
  additional_notes TEXT,
  -- Startup-specific fields
  company_legal_name TEXT,
  business_registration_number TEXT,
  company_website TEXT,
  authorized_representative TEXT,
  representative_designation TEXT,
  -- Common
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFIED', 'REJECTED')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_verification_submissions_updated_at ON public.verification_submissions;
CREATE TRIGGER trg_verification_submissions_updated_at
  BEFORE UPDATE ON public.verification_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.verification_submissions TO anon, authenticated;

-- Users can see their own submissions
CREATE POLICY "verif_submissions_select_own" ON public.verification_submissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own submissions
CREATE POLICY "verif_submissions_insert_own" ON public.verification_submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only service_role can update submissions (admin approval goes through RPC)
CREATE POLICY "verif_submissions_no_direct_update" ON public.verification_submissions
  FOR UPDATE TO authenticated
  USING (false);


-- 4. Secure admin-only approval function for LAWYERS
--    SECURITY DEFINER so it runs as the DB owner (bypasses RLS)
--    Only a caller who is themselves an ADMIN in profiles can invoke it.
CREATE OR REPLACE FUNCTION public.admin_review_lawyer(
  p_lawyer_id UUID,
  p_action TEXT,          -- 'VERIFY' or 'REJECT'
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller_role TEXT;
  v_new_status TEXT;
BEGIN
  -- Check caller is ADMIN
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'ADMIN' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  IF p_action = 'VERIFY' THEN
    v_new_status := 'VERIFIED';
  ELSIF p_action = 'REJECT' THEN
    v_new_status := 'REJECTED';
    IF p_rejection_reason IS NULL OR trim(p_rejection_reason) = '' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Rejection reason is required');
    END IF;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action. Use VERIFY or REJECT');
  END IF;

  UPDATE public.lawyers SET
    verification_status = v_new_status,
    verification_reviewed_at = NOW(),
    verification_reviewed_by = auth.uid()::TEXT,
    verification_rejection_reason = p_rejection_reason
  WHERE id = p_lawyer_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lawyer not found');
  END IF;

  -- Update latest submission record
  UPDATE public.verification_submissions SET
    status = v_new_status,
    reviewed_at = NOW(),
    reviewed_by = auth.uid()::TEXT,
    rejection_reason = p_rejection_reason
  WHERE entity_id = p_lawyer_id
    AND entity_type = 'LAWYER'
    AND status = 'SUBMITTED'
  ;

  RETURN jsonb_build_object('success', true, 'new_status', v_new_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_review_lawyer(UUID, TEXT, TEXT) TO authenticated;


-- 5. Secure admin-only approval function for STARTUPS
CREATE OR REPLACE FUNCTION public.admin_review_startup(
  p_startup_id UUID,
  p_action TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller_role TEXT;
  v_new_status TEXT;
BEGIN
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'ADMIN' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  IF p_action = 'VERIFY' THEN
    v_new_status := 'VERIFIED';
  ELSIF p_action = 'REJECT' THEN
    v_new_status := 'REJECTED';
    IF p_rejection_reason IS NULL OR trim(p_rejection_reason) = '' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Rejection reason is required');
    END IF;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action. Use VERIFY or REJECT');
  END IF;

  UPDATE public.startups SET
    verification_status = v_new_status,
    verification_reviewed_at = NOW(),
    verification_reviewed_by = auth.uid()::TEXT,
    verification_rejection_reason = p_rejection_reason
  WHERE id = p_startup_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Startup not found');
  END IF;

  UPDATE public.verification_submissions SET
    status = v_new_status,
    reviewed_at = NOW(),
    reviewed_by = auth.uid()::TEXT,
    rejection_reason = p_rejection_reason
  WHERE entity_id = p_startup_id
    AND entity_type = 'STARTUP'
    AND status = 'SUBMITTED'
  ;

  RETURN jsonb_build_object('success', true, 'new_status', v_new_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_review_startup(UUID, TEXT, TEXT) TO authenticated;


-- 6. Admin: list all pending verification submissions (RPC)
CREATE OR REPLACE FUNCTION public.admin_list_verifications(
  p_status TEXT DEFAULT 'SUBMITTED'  -- SUBMITTED, VERIFIED, REJECTED, or ALL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_caller_role TEXT;
  v_results JSONB;
BEGIN
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'ADMIN' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  IF p_status = 'ALL' THEN
    SELECT jsonb_agg(row_to_json(vs)) INTO v_results
    FROM public.verification_submissions vs;
  ELSE
    SELECT jsonb_agg(row_to_json(vs)) INTO v_results
    FROM public.verification_submissions vs
    WHERE vs.status = p_status;
  END IF;

  RETURN jsonb_build_object('success', true, 'data', COALESCE(v_results, '[]'::JSONB));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_verifications(TEXT) TO authenticated;


-- 7. Update run_matching to ONLY match VERIFIED lawyers
CREATE OR REPLACE FUNCTION public.run_matching(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_req public.legal_requests%ROWTYPE;
  v_lawyer public.lawyers%ROWTYPE;
  v_score INT;
  v_reasons TEXT[];
  v_matched_count INT := 0;
  v_min_overlap INT;
  v_max_overlap INT;
  v_has_expertise BOOLEAN;
  v_exp TEXT;
BEGIN
  SELECT * INTO v_req FROM public.legal_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;

  -- Stage 3 change: only loop over VERIFIED lawyers (not demo, not pending/submitted/rejected)
  FOR v_lawyer IN
    SELECT * FROM public.lawyers
    WHERE verification_status = 'VERIFIED'
      AND (is_demo IS NULL OR is_demo = FALSE)
  LOOP
    -- Check mandatory requirements:
    -- 1. Practice Area must match matter_type
    IF NOT (v_req.matter_type = ANY(v_lawyer.practice_areas)) THEN
      CONTINUE;
    END IF;

    -- 2. Jurisdiction must match
    IF NOT (v_req.jurisdiction = ANY(v_lawyer.jurisdictions)) THEN
      CONTINUE;
    END IF;

    -- Initialize scoring and reasons
    v_score := 55; -- 30 for practice area + 25 for jurisdiction
    v_reasons := ARRAY[
      'Matches required practice area: ' || v_req.matter_type,
      'Licensed in jurisdiction: ' || v_req.jurisdiction
    ];

    -- Budget Compatibility (+20)
    IF v_req.currency = v_lawyer.currency AND v_lawyer.retainer_min IS NOT NULL AND v_lawyer.retainer_max IS NOT NULL THEN
      v_min_overlap := GREATEST(v_req.budget_min, v_lawyer.retainer_min);
      v_max_overlap := LEAST(v_req.budget_max, v_lawyer.retainer_max);
      IF v_min_overlap <= v_max_overlap THEN
        v_score := v_score + 20;
        v_reasons := array_append(v_reasons, 'Budget expectations match');
      END IF;
    END IF;

    -- Availability (+10)
    IF v_req.availability = v_lawyer.availability THEN
      v_score := v_score + 10;
      v_reasons := array_append(v_reasons, 'Availability preferences match');
    END IF;

    -- Experience (+5)
    IF v_lawyer.years_experience IS NOT NULL AND v_lawyer.years_experience > 0 THEN
      v_score := v_score + 5;
      v_reasons := array_append(v_reasons, v_lawyer.years_experience || ' years of experience');
    END IF;

    -- Industry (+5)
    IF v_req.industry = ANY(v_lawyer.industries) THEN
      v_score := v_score + 5;
      v_reasons := array_append(v_reasons, 'Experience in ' || v_req.industry || ' industry');
    END IF;

    -- Contract Expertise (+5)
    v_has_expertise := FALSE;
    FOREACH v_exp IN ARRAY v_req.required_expertise LOOP
      IF v_exp = ANY(v_lawyer.contract_expertise) THEN
        v_has_expertise := TRUE;
        EXIT;
      END IF;
    END LOOP;
    IF v_has_expertise THEN
      v_score := v_score + 5;
      v_reasons := array_append(v_reasons, 'Has specific contract expertise required');
    END IF;

    -- Threshold check
    IF v_score >= 55 THEN
      INSERT INTO public.matches (legal_request_id, lawyer_id, startup_id, match_reasons, status)
      VALUES (v_req.id, v_lawyer.id, v_req.startup_id, v_reasons, 'PENDING')
      ON CONFLICT (legal_request_id, lawyer_id)
      DO UPDATE SET match_reasons = EXCLUDED.match_reasons, updated_at = NOW();

      v_matched_count := v_matched_count + 1;
    END IF;
  END LOOP;

  UPDATE public.legal_requests
  SET status = CASE WHEN v_matched_count > 0 THEN 'MATCHED' ELSE 'MATCHING' END,
      submitted_at = COALESCE(submitted_at, NOW()),
      updated_at = NOW()
  WHERE id = p_request_id;

  RETURN jsonb_build_object('success', true, 'matched_count', v_matched_count);
END;
$$;


-- 8. Drop overly permissive existing lawyer update policy and replace with tighter one
--    The old policy allowed updating verification_status from the client.
DROP POLICY IF EXISTS "lawyers_update_own" ON public.lawyers;

-- New policy: lawyers can update their own profile but NOT verification_status, verification_reviewed_*, verification_rejection_reason
-- We can't column-restrict policies in Postgres directly, so we add a CHECK that prevents
-- changing the verification_status to VERIFIED or REJECTED from the client.
CREATE POLICY "lawyers_update_own" ON public.lawyers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Prevent client from self-approving: verification_status must stay PENDING or SUBMITTED
    -- (VERIFIED and REJECTED can only be set by admin_review_lawyer RPC which runs as SECURITY DEFINER)
    AND verification_status IN ('PENDING', 'SUBMITTED')
  );

-- 9. Drop overly permissive startup update policy and tighten
DROP POLICY IF EXISTS "startups_update_own" ON public.startups;

CREATE POLICY "startups_update_own" ON public.startups
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND verification_status IN ('PENDING', 'SUBMITTED')
  );

-- 10. Tighten matches policies — only involved parties should be able to update match status
DROP POLICY IF EXISTS "matches_update_all" ON public.matches;
CREATE POLICY "matches_update_involved" ON public.matches
  FOR UPDATE TO authenticated
  USING (
    -- Startup owns the request
    startup_id IN (SELECT id FROM public.startups WHERE user_id = auth.uid())
    OR
    -- Lawyer is the matched lawyer
    lawyer_id IN (SELECT id FROM public.lawyers WHERE user_id = auth.uid())
  );

-- 11. Tighten matches insert — only service role / run_matching RPC should insert
--     (The RPC is SECURITY DEFINER so it can bypass this)
DROP POLICY IF EXISTS "matches_insert_all" ON public.matches;
CREATE POLICY "matches_insert_rpc_only" ON public.matches
  FOR INSERT TO authenticated
  WITH CHECK (false);  -- Direct client inserts blocked; run_matching RPC (SECURITY DEFINER) bypasses RLS
