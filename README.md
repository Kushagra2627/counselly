# Counselly — Fractional General Counsel for Startups

> **Live Deployment:** [https://a2a2t997.insforge.site](https://a2a2t997.insforge.site)  
> **Backend Platform:** InsForge BaaS (`ap-southeast`)  
> **InsForge API Base:** `https://a2a2t997.ap-southeast.insforge.app`

---

## 🏛️ Executive Overview

**Counselly** is a two-sided legal technology marketplace and engagement platform connecting high-growth startups and tech enterprises with verified corporate, commercial, and technology lawyers for flexible, ongoing fractional General Counsel support through monthly retainers.

> **Disclaimer:** Counselly is a technology marketplace and engagement-management platform connecting businesses with legal professionals. It does not provide legal advice, nor is it an automated legal-advice engine.

---

## ⚡ Live Status & Key Architecture Highlights

| Component | Status | Details |
| :--- | :--- | :--- |
| **Frontend Web App** | 🟢 **Live** | Deployed on InsForge hosting at [https://a2a2t997.insforge.site](https://a2a2t997.insforge.site) |
| **Backend & Database** | 🟢 **Cloud Native** | Hosted on **InsForge** with managed PostgreSQL, built-in Auth, PostgREST API & RPC |
| **Automated Matching** | 🟢 **Active** | In-database PostgreSQL stored procedure (`public.run_matching`) evaluating 7 weighted criteria |
| **Local PostgreSQL Dependency** | ❌ **Eliminated** | Zero local database or Node server setup required; runs completely cloud-native |
| **Demo Counsel Profiles** | 🟢 **Seeded** | 5 realistic corporate & technology counsel profiles available for instant discovery & testing |

---

## 🚀 Core Features Built (Stage 1)

### 1. Luxury Editorial Public Landing Page
- **Cinematic Hero**: Serif headlines, refined typography, and high-contrast call-to-actions for startups and lawyers.
- **Trust & Category Pills**: Immediate visual display of key practice areas (Corporate, Commercial Contracts, SaaS, IP, Compliance, etc.).
- **How It Works**: 3-step editorial process (Define Need → Meet Counsel → Build Engagement).
- **Practice Areas Grid**: Comprehensive breakdown of corporate legal disciplines.
- **Elite Counsel Preview Cards**: Interactive preview cards showing experience, jurisdictions, retainer ranges, and practice tags.
- **Two-Sided Split CTA**: Dedicated value propositions tailored for founders vs. attorneys.
- **Engagement Flow**: Step-by-step transparency from requirement definition to completion.

### 2. Cloud Authentication & Role-Based Access Control
- **Dual Role System**: Registration strictly constrained to `STARTUP` or `LAWYER` (administrative roles provisioned internally).
- **Session Management**: Built with `@insforge/sdk`, token handling, and session state persistence via `AuthContext`.
- **Protected Routing**: `ProtectedRoute` component enforcing authenticated sessions, role permissions, and onboarding completion before dashboard access.
- **Auth Views**: Sign In, Register (with role selector), Forgot Password, and Reset Password.

### 3. Step-by-Step Onboarding Wizards
- **Startup Onboarding**: 3-step wizard capturing Company Profile (name, jurisdiction, size, industry) → First Legal Matter (matter type, expected hours, budget range, urgency) → Review & Submission.
- **Lawyer Onboarding**: 4-step wizard capturing Professional Experience (title, practice areas, jurisdictions, languages) → Bar Credentials & Verification → Retainer Pricing & Monthly Capacity → Review & Submission.

### 4. Startup Dashboard
- **Overview Page**: Real-time counter of total, draft, and active legal requests, along with match indicators.
- **Legal Requests Hub**: Filterable list of all submitted and draft legal matters with status badges.
- **Create Legal Matter**: Comprehensive requirement builder with matter types, practice areas, budget min/max, expected hours, currency, urgency, and optional instant submission.
- **Legal Matter Detail View**: Complete matter specification with live matched counsel list and compatibility breakdown.
- **Matched Counsel Directory**: Search and filter available counsel by practice area, jurisdiction, currency, and availability.
- **Lawyer Profile View**: Full biographical dossier, credentials, practice areas, retainer rates, and direct engagement requests.
- **Company Profile & Account Settings**: Company details editor, password management, and security controls.

### 5. Lawyer Dashboard
- **Overview Page**: Inbound matches, active client engagements, monthly capacity tracking, and verification status.
- **Marketplace Feed**: Browse active requirements posted by startups across compatible jurisdictions and practice areas.
- **My Client Matches**: Incoming startup match feed with compatibility reasons, retainer comparison, and one-click Accept/Decline actions.
- **Counsel Profile Editor**: Manage title, years of experience, bar jurisdictions, practice areas, retainer min/max rates, and monthly bandwidth.
- **Bar Verification Tracker**: State Bar / Law Society credential submission and review status tracking (`PENDING`, `SUBMITTED`, `VERIFIED`, `REJECTED`).
- **Account Settings**: Password management and session security.

### 6. Configurable In-Database Matching Engine (`run_matching`)
Calculates two-sided compatibility dynamically inside PostgreSQL on request submission:
- **Mandatory Eligibility**: Practice Area match + Jurisdiction match.
- **Budget Compatibility (+20 pts)**: Overlap condition $\max(\text{budgetMin}, \text{retainerMin}) \le \min(\text{budgetMax}, \text{retainerMax})$ for matching currencies.
- **Availability Match (+10 pts)**: Timelines align (e.g., "Immediate", "Within 1 week").
- **Experience (+5 pts)**: Years of experience evaluated.
- **Industry Experience (+5 pts)**: Startup industry matches counsel's domain background.
- **Contract Expertise (+5 pts)**: Specific contract types overlap (SaaS Agreements, MSAs, NDAs, etc.).
- **Human-Readable Explanations**: Stored as badges (e.g., `✓ Matches required practice area`, `✓ Budget expectations match`).

---

## 📂 Project Structure & File Manifest

```text
fractional(antigravity)/
├── .insforge/
│   └── project.json                  # Linked InsForge project configuration
├── migrations/
│   └── 20261002004434_init-counselly-schema.sql  # Database DDL, RLS policies, seed data & RPC
├── client/
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx / Navbar.css        # Sticky dynamic navigation bar
│   │   │   │   ├── Sidebar.tsx / Sidebar.css      # Dashboard sidebar navigation
│   │   │   │   └── Footer.tsx / Footer.css        # Footer with legal links
│   │   │   └── ui/
│   │   │       ├── Avatar.tsx / Avatar.css        # Initials/image avatar component
│   │   │       ├── Badge.tsx / Badge.css          # Pill badge with variants
│   │   │       ├── Button.tsx / Button.css        # Luxury styled buttons (primary, secondary, ghost)
│   │   │       ├── Card.tsx / Card.css            # Bordered card containers
│   │   │       ├── EmptyState.tsx / EmptyState.css # Empty state placeholders
│   │   │       ├── Icon.tsx / Icon.css            # Inline SVG icon library
│   │   │       ├── Input.tsx / Input.css          # Form inputs with labels & error states
│   │   │       ├── LoadingState.tsx / LoadingState.css # Loading spinners
│   │   │       ├── Modal.tsx / Modal.css          # Accessible dialog modals
│   │   │       ├── MultiSelect.tsx / MultiSelect.css # Tag-based multi-selector
│   │   │       ├── PageHeader.tsx / PageHeader.css # Standardized dashboard headers
│   │   │       ├── ProgressBar.tsx / ProgressBar.css # Onboarding step indicators
│   │   │       ├── Select.tsx / Select.css        # Styled dropdown selects
│   │   │       ├── StatusBadge.tsx / StatusBadge.css # Color-coded status indicators
│   │   │       └── Table.tsx / Table.css          # Responsive data tables
│   │   ├── config/
│   │   │   └── constants.ts          # Practice areas, jurisdictions, currencies, nav menus
│   │   ├── features/
│   │   │   └── auth/
│   │   │       ├── AuthContext.tsx   # React Auth context with InsForge session sync
│   │   │       └── ProtectedRoute.tsx # Route guard for authentication and onboarding
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx        # Centered auth card layout
│   │   │   ├── DashboardLayout.tsx   # Topbar + collapsible responsive sidebar
│   │   │   └── PublicLayout.tsx      # Public header + content + footer wrapper
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx / auth.css       # Sign in page
│   │   │   │   ├── RegisterPage.tsx               # Dual-role signup page
│   │   │   │   ├── ForgotPasswordPage.tsx         # Password recovery
│   │   │   │   └── ResetPasswordPage.tsx          # Password reset entry
│   │   │   ├── errors/
│   │   │   │   ├── NotFoundPage.tsx               # 404 handler
│   │   │   │   └── UnauthorizedPage.tsx           # 403 handler
│   │   │   ├── lawyer/
│   │   │   │   ├── LawyerOverviewPage.tsx         # Lawyer statistics & active matches
│   │   │   │   ├── LawyerRequestsPage.tsx         # Open marketplace requirements
│   │   │   │   ├── LawyerMatchesPage.tsx          # Match invitations & accept/decline
│   │   │   │   ├── LawyerProfileEditorPage.tsx    # Counsel bio, rates & jurisdictions
│   │   │   │   ├── LawyerVerificationPage.tsx     # State Bar verification workflow
│   │   │   │   └── LawyerSettingsPage.tsx         # Account security settings
│   │   │   ├── onboarding/
│   │   │   │   ├── StartupOnboardingPage.tsx      # 3-step startup wizard
│   │   │   │   ├── LawyerOnboardingPage.tsx       # 4-step lawyer wizard
│   │   │   │   └── onboarding.css                 # Onboarding design styles
│   │   │   ├── public/
│   │   │   │   ├── LandingPage.tsx / LandingPage.css # High-converting editorial landing page
│   │   │   └── startup/
│   │   │       ├── StartupOverviewPage.tsx        # Startup request counts & status
│   │   │       ├── LegalRequestsPage.tsx          # Request management table
│   │   │       ├── CreateLegalRequestPage.tsx     # Matter requirement creation form
│   │   │       ├── LegalRequestDetailPage.tsx     # Matter details & matched counsel
│   │   │       ├── MatchedCounselPage.tsx         # Directory & counsel filtering
│   │   │       ├── LawyerProfileViewPage.tsx      # Counsel profile & engagement request
│   │   │       ├── CompanyProfilePage.tsx         # Company info editor
│   │   │       └── StartupSettingsPage.tsx        # Account security settings
│   │   ├── services/
│   │   │   ├── insforge.ts           # InsForge SDK client initialization
│   │   │   ├── auth.service.ts       # Auth, session, and role profile operations
│   │   │   ├── startup.service.ts    # Startup profile and metrics queries
│   │   │   ├── lawyer.service.ts     # Lawyer profile, filters, and directory queries
│   │   │   ├── legalRequest.service.ts # Legal matter CRUD and submit with matching trigger
│   │   │   └── match.service.ts      # Two-sided match queries and status updates
│   │   ├── styles/
│   │   │   ├── reset.css             # Modern CSS reset
│   │   │   ├── typography.css        # Serif + sans-serif font styling
│   │   │   ├── utilities.css         # Flex, grid, and layout utility classes
│   │   │   └── variables.css         # Design tokens (charcoal, navy, gold, ivory)
│   │   ├── utils/
│   │   │   └── formatters.ts         # Currency and date formatters
│   │   ├── App.tsx                   # Main route configuration
│   │   └── main.tsx                  # React DOM mount point
│   ├── .env                          # Local frontend environment variables
│   ├── package.json                  # Dependencies: React 19, @insforge/sdk, Vite
│   ├── tsconfig.json                 # TypeScript project configuration
│   ├── vercel.json                   # SPA routing rewrites for live deployment
│   └── vite.config.ts                # Vite build and dev configuration
├── .gitignore                        # Git exclusion rules
├── AGENTS.md                         # InsForge platform guidance for AI coding agents
├── insforge.toml                     # Declarative project and auth configuration
└── README.md                         # This documentation file
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repo-url>
cd fractional(antigravity)/client
npm install
```

### 2. Configure Environment Variables
A `.env` file is already pre-configured in `client/.env` pointing to the live InsForge cloud backend:
```env
VITE_INSFORGE_URL=https://a2a2t997.ap-southeast.insforge.app
VITE_INSFORGE_ANON_KEY=anon_9c210eedc78d68b8b92fffc1dbc7db52dc31a52fa197de0c066a180dd4128444
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🚢 Cloud Deployment via InsForge CLI

To redeploy the frontend application after making changes:

```bash
# Run from the repository root:
npx -y @insforge/cli deployments deploy client
```

This bundles the source files, pushes them to InsForge hosting, and refreshes the live site at:  
👉 **[https://a2a2t997.insforge.site](https://a2a2t997.insforge.site)**

---

## 🛡️ Database Management (InsForge CLI)

The database runs directly on InsForge PostgreSQL. You can inspect or manage it with the CLI:

```bash
# View all tables
npx -y @insforge/cli db query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"

# Query seeded demo lawyers
npx -y @insforge/cli db query "SELECT name, title, currency, retainer_min, retainer_max FROM public.lawyers"

# Create a new migration
npx -y @insforge/cli db migrations new <migration-name>

# Apply pending migrations
npx -y @insforge/cli db migrations up --all
```
