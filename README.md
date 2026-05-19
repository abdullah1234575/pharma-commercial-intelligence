# Pharma Commercial Intelligence | Synaptic Group

Multi-tenant SaaS analytics platform for pharmaceutical commercial intelligence.

## Capabilities

- Supabase Auth-ready login/signup
- Tenant workspace model with RBAC roles: `owner`, `admin`, `analyst`, `viewer`
- Row-level security schema for private tenant data
- Excel/CSV upload with drag and drop, progress, upload history, validation, and retry
- Multi-sheet processing through `xlsx`
- AI-assisted schema mapping for varied company column names
- Dynamic KPI generation from uploaded rows only
- Dynamic filters generated from tenant data
- Adaptive charts for sales trends, targets, product ranking, territory performance, reps, market intelligence, forecasting, and customer insights
- AI-style insight engine for growth drivers, anomalies, territory risks, brand performance, and rep effectiveness
- Saved dashboard configs, CSV export, PDF print/export, and live refresh controls
- Responsive executive UI with dark/light mode

## Run Locally

```powershell
npm.cmd install --cache .npm-cache
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

### Production build

```powershell
npm.cmd run build
```

This verifies the complete app, including authentication, upload flow, and exports.

Login/signup page: [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login).

## Supabase Setup

1. Create a Supabase project.
2. Run [supabase/schema.sql](</C:/Users/Abdullah Alshawadfy/Documents/Pharma Commercial Intelligence and Analytics/supabase/schema.sql>) in the Supabase SQL editor.
3. Add these Vercel/local environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SENDGRID_API_KEY=
LEAD_NOTIFICATION_EMAIL=Abdullahalshawadfy410@gmail.com
```

### Local environment file

Copy the values into `.env.local` for local development. Do not commit `.env.local` to source control.

### Notification setup

The app uses SendGrid for admin lead notifications. If `SENDGRID_API_KEY` is not configured, notification calls are safely skipped and the app continues running.

The schema creates:

- `users`
- `workspaces`
- `workspace_members`
- `uploads`
- `processed_data`
- `ai_insights`
- `dashboard_configs`

RLS policies isolate every tenant by `workspace_id`.

## Data Flow

1. User signs up through Supabase Auth.
2. Signup trigger creates a private workspace and owner membership.
3. User uploads CSV/XLS/XLSX files.
4. Mapping engine detects commercial fields, including sales, products, dates, territories, reps, managers, targets, forecast, market size, units, and margin.
5. Processed rows are stored locally for preview and persisted to Supabase when auth is configured.
6. KPI cards, filters, charts, alerts, and insights are generated from `processed_data`.

## Key Files

- Dashboard: `components/dashboard.tsx`
- Upload UI: `components/upload/upload-center.tsx`
- Schema mapping: `lib/data-mapping.ts`
- Dynamic analytics: `lib/analytics.ts`
- Supabase client: `lib/supabase.ts`
- Supabase persistence: `lib/persistence.ts`
- Login/signup: `app/login/login-client.tsx`
- RLS schema: `supabase/schema.sql`
