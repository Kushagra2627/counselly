# Counselly — Database Schema

## Platform

**InsForge** (Postgres-based BaaS) — API: `https://a2a2t997.ap-southeast.insforge.app`

Row Level Security (RLS) is enabled on all tables. All access is scoped to `auth.uid()`.

---

## Tables

### `users` (managed by InsForge Auth)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| email | text | Unique |
| role | text | `STARTUP` \| `LAWYER` \| `ADMIN` |
| created_at | timestamptz | Auto |

> User records are created and managed by InsForge Auth. The `users` table extends `auth.users`.

---

### `startup_profiles`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, references `auth.users(id)` |
| company_name | text | |
| website | text | |
| industry | text | |
| company_size | text | |
| country | text | |
| jurisdiction | text | |
| description | text | |
| onboarding_step | integer | Default 0 |
| onboarding_done | boolean | Default false |
| verification_status | text | `PENDING` \| `SUBMITTED` \| `VERIFIED` \| `REJECTED` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `lawyer_profiles`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, references `auth.users(id)` |
| title | text | |
| years_experience | integer | |
| jurisdictions | text[] | |
| practice_areas | text[] | |
| industries | text[] | |
| contract_expertise | text[] | |
| languages | text[] | |
| about | text | |
| availability | text | |
| retainer_min | integer | |
| retainer_max | integer | |
| currency | text | |
| monthly_capacity | integer | |
| verification_status | text | `PENDING` \| `SUBMITTED` \| `VERIFIED` \| `REJECTED` |
| onboarding_step | integer | |
| onboarding_done | boolean | |
| is_demo | boolean | Demo profiles seeded at launch |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `legal_requests`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| startup_id | uuid | FK → `startup_profiles(id)` |
| title | text | |
| matter_type | text | |
| description | text | |
| industry | text | |
| jurisdiction | text | |
| required_expertise | text[] | |
| budget_min | integer | |
| budget_max | integer | |
| currency | text | |
| expected_hours | integer | |
| urgency | text | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| availability | text | |
| status | text | `DRAFT` \| `SUBMITTED` \| `MATCHING` \| `MATCHED` \| `COMPLETED` |
| submitted_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `matches`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| legal_request_id | uuid | FK → `legal_requests(id)` |
| lawyer_id | uuid | FK → `lawyer_profiles(id)` |
| startup_id | uuid | FK → `startup_profiles(id)` |
| match_reasons | text[] | |
| score | integer | Match score 0–100 |
| status | text | `PENDING` \| `ACCEPTED` \| `DECLINED` \| `ENGAGED` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `verification_submissions`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| entity_type | text | `LAWYER` \| `STARTUP` |
| entity_id | uuid | FK → lawyer or startup profile |
| user_id | uuid | FK → `auth.users(id)` |
| status | text | `SUBMITTED` \| `VERIFIED` \| `REJECTED` |
| submitted_at | timestamptz | |
| reviewed_at | timestamptz | |
| reviewed_by | uuid | Admin user ID |
| rejection_reason | text | Populated on rejection |
| bar_number | text | Lawyer only |
| licensing_body | text | Lawyer only |
| professional_email | text | Lawyer only |
| linkedin_url | text | Lawyer only |
| additional_notes | text | Lawyer only |
| company_legal_name | text | Startup only |
| business_registration_number | text | Startup only |
| company_website | text | Startup only |
| authorized_representative | text | Startup only |
| representative_designation | text | Startup only |

---

## RPC Functions

### `match_lawyers(p_request_id uuid)`

Runs the matching algorithm for a submitted legal request. Called after request submission.

- Fetches all real (non-demo, verified) lawyer profiles
- Scores each lawyer against the request across multiple dimensions
- Upserts results into `matches` table
- Returns number of matches created

---

## Row Level Security (RLS) Summary

| Table | Policy |
|-------|--------|
| `startup_profiles` | Users can only read/write their own profile |
| `lawyer_profiles` | Users can read/write own profile; startups can read public fields of verified lawyers |
| `legal_requests` | Startups can CRUD their own requests; lawyers can read matched requests |
| `matches` | Startups see their own matches; lawyers see matches assigned to them |
| `verification_submissions` | Users can read/submit their own; admins can read all and update status |

---

## Migrations

Located in [`backend/migrations/`](../backend/migrations/):

| File | Description |
|------|-------------|
| `20261002004434_init-counselly-schema.sql` | Initial schema — all core tables, RLS, RPC matching function |
| `20261003_stage3_verification.sql` | Stage 3 — verification_submissions table + RLS |
