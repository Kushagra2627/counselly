-- ====================================================================
-- Counselly Database Schema Migration for InsForge
-- ====================================================================

-- 1. Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STARTUP', 'LAWYER', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Startups Table
CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  country TEXT,
  jurisdiction TEXT,
  description TEXT,
  onboarding_step INT DEFAULT 0,
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lawyers Table
CREATE TABLE IF NOT EXISTS public.lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  title TEXT,
  years_experience INT DEFAULT 0,
  jurisdictions TEXT[] DEFAULT '{}',
  practice_areas TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  contract_expertise TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  about TEXT,
  availability TEXT,
  retainer_min INT,
  retainer_max INT,
  currency TEXT DEFAULT 'INR',
  monthly_capacity INT DEFAULT 5,
  verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED')),
  onboarding_step INT DEFAULT 0,
  onboarding_done BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Legal Requests Table
CREATE TABLE IF NOT EXISTS public.legal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  matter_type TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  required_expertise TEXT[] DEFAULT '{}',
  budget_min INT NOT NULL,
  budget_max INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  expected_hours INT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  availability TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'MATCHING', 'MATCHED', 'LAWYER_SELECTED', 'ENGAGEMENT_ACTIVE', 'COMPLETED')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_request_id UUID NOT NULL REFERENCES public.legal_requests(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  match_reasons TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'ENGAGED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(legal_request_id, lawyer_id)
);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_startups_updated_at ON public.startups;
CREATE TRIGGER trg_startups_updated_at BEFORE UPDATE ON public.startups FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_lawyers_updated_at ON public.lawyers;
CREATE TRIGGER trg_lawyers_updated_at BEFORE UPDATE ON public.lawyers FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_legal_requests_updated_at ON public.legal_requests;
CREATE TRIGGER trg_legal_requests_updated_at BEFORE UPDATE ON public.legal_requests FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_matches_updated_at ON public.matches;
CREATE TRIGGER trg_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 7. Matching Algorithm Function (RPC)
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

  FOR v_lawyer IN SELECT * FROM public.lawyers LOOP
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

    -- Threshold check (55 is the standard threshold)
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

-- 8. Seed Demo Lawyers (fictional demonstration profiles)
INSERT INTO public.lawyers (
  name, email, title, years_experience, jurisdictions, practice_areas, industries,
  contract_expertise, languages, about, availability, retainer_min, retainer_max,
  currency, monthly_capacity, verification_status, onboarding_step, onboarding_done, is_demo
) VALUES
(
  'Arjun Sharma',
  'arjun.sharma@demo.counselly.internal',
  'Corporate & Commercial Counsel',
  14,
  ARRAY['India'],
  ARRAY['Corporate', 'Commercial Contracts', 'Dispute Resolution'],
  ARRAY['Technology', 'SaaS', 'Manufacturing'],
  ARRAY['Master Service Agreements', 'NDAs', 'Term Sheets'],
  ARRAY['English', 'Hindi'],
  'Specialist corporate attorney advising technology companies and growth-stage enterprises on high-stakes transactions and ongoing general counsel services.',
  'Within 1 week',
  120000,
  180000,
  'INR',
  5,
  'PENDING',
  4,
  TRUE,
  TRUE
),
(
  'Priya Mehta',
  'priya.mehta@demo.counselly.internal',
  'Technology & SaaS Counsel',
  10,
  ARRAY['India', 'Singapore'],
  ARRAY['SaaS & Technology', 'Privacy & Data Protection', 'Commercial Contracts'],
  ARRAY['Technology', 'SaaS', 'Fintech'],
  ARRAY['SaaS Agreements', 'Vendor Agreements', 'NDAs', 'Licensing Agreements'],
  ARRAY['English', 'Hindi'],
  'Advising enterprise software and fintech scale-ups on cross-border licensing, global data privacy regimes, and cloud vendor agreements.',
  'Immediate',
  90000,
  150000,
  'INR',
  4,
  'PENDING',
  4,
  TRUE,
  TRUE
),
(
  'Rajesh Nair',
  'rajesh.nair@demo.counselly.internal',
  'Regulatory & Compliance Counsel',
  16,
  ARRAY['India'],
  ARRAY['Regulatory & Compliance', 'Corporate', 'Employment & HR'],
  ARRAY['Fintech', 'Healthcare', 'Energy'],
  ARRAY['Founder Agreements', 'Employment Contracts', 'Partnership Agreements'],
  ARRAY['English', 'Hindi', 'Malayalam'],
  'Former senior legal counsel with extensive regulatory advocacy, governance, and commercial structuring experience across regulated sectors.',
  'Within 2 weeks',
  150000,
  220000,
  'INR',
  3,
  'PENDING',
  4,
  TRUE,
  TRUE
),
(
  'Sunita Krishnan',
  'sunita.krishnan@demo.counselly.internal',
  'Employment & HR Counsel',
  11,
  ARRAY['India'],
  ARRAY['Employment & HR', 'Commercial Contracts', 'Corporate'],
  ARRAY['Technology', 'E-Commerce', 'Education'],
  ARRAY['Employment Contracts', 'NDAs', 'Partnership Agreements'],
  ARRAY['English', 'Hindi', 'Tamil'],
  'Dedicated counsel for early-stage and high-growth employers on talent acquisition contracts, founder arrangements, and workforce policies.',
  'Immediate',
  80000,
  130000,
  'INR',
  6,
  'PENDING',
  4,
  TRUE,
  TRUE
),
(
  'David Chen',
  'david.chen@demo.counselly.internal',
  'IP & Commercial Counsel',
  12,
  ARRAY['United States', 'Singapore'],
  ARRAY['Intellectual Property', 'Commercial Contracts', 'SaaS & Technology'],
  ARRAY['Technology', 'SaaS', 'Healthcare'],
  ARRAY['Licensing Agreements', 'SaaS Agreements', 'NDAs', 'Master Service Agreements'],
  ARRAY['English', 'Mandarin'],
  'Intellectual property and commercial contracting strategist assisting US-market tech innovators and multinational software companies.',
  'Within 1 week',
  8000,
  12000,
  'USD',
  4,
  'PENDING',
  4,
  TRUE,
  TRUE
)
ON CONFLICT DO NOTHING;

-- 9. Row Level Security and Permissions
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Grants to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO anon, authenticated;
GRANT ALL ON TABLE public.startups TO anon, authenticated;
GRANT ALL ON TABLE public.lawyers TO anon, authenticated;
GRANT ALL ON TABLE public.legal_requests TO anon, authenticated;
GRANT ALL ON TABLE public.matches TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_matching(UUID) TO anon, authenticated;

-- Policies
-- Profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Startups
CREATE POLICY "startups_select_all" ON public.startups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "startups_insert_own" ON public.startups FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "startups_update_own" ON public.startups FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Lawyers
CREATE POLICY "lawyers_select_all" ON public.lawyers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "lawyers_insert_own" ON public.lawyers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR is_demo = true);
CREATE POLICY "lawyers_update_own" ON public.lawyers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Legal Requests
CREATE POLICY "legal_requests_select_all" ON public.legal_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "legal_requests_insert_own" ON public.legal_requests FOR INSERT TO authenticated WITH CHECK (
  startup_id IN (SELECT id FROM public.startups WHERE user_id = auth.uid())
);
CREATE POLICY "legal_requests_update_own" ON public.legal_requests FOR UPDATE TO authenticated USING (
  startup_id IN (SELECT id FROM public.startups WHERE user_id = auth.uid())
);
CREATE POLICY "legal_requests_delete_own" ON public.legal_requests FOR DELETE TO authenticated USING (
  startup_id IN (SELECT id FROM public.startups WHERE user_id = auth.uid())
);

-- Matches
CREATE POLICY "matches_select_all" ON public.matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "matches_insert_all" ON public.matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "matches_update_all" ON public.matches FOR UPDATE TO authenticated USING (true);
