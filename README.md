# Pharma Commercial Intelligence

Executive-level pharmaceutical commercial dashboard built with Next.js, React, Tailwind CSS, Recharts, and a Supabase/PostgreSQL-ready data layer.

## Run Locally

```powershell
npm.cmd install --cache .npm-cache
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## What Is Included

- Responsive executive dashboard with light/dark mode
- Sidebar navigation and sticky executive toolbar
- Interactive slicers for year, quarter, month, region, territory, product line, brand, medical rep, manager, customer type, and channel
- KPI cards for sales, growth, market share, achievement, forecast accuracy, margin, productivity, Rx growth, IMS growth, YTD sales, MAT growth, and more
- Recharts visuals: line, area, bar, composed, donut, scatter, treemap, heatmap-style territory grid, and waterfall-style variance view
- AI-style insights, performance alerts, search shell, export controls, RBAC control, and live refresh timestamp
- API-ready route at `/api/commercial`

## Data Architecture

Sample data is generated in `lib/pharma-data.ts` as commercial fact records with:

- Date hierarchy: `year`, `quarter`, `month`, `monthIndex`
- Commercial geography: `region`, `territory`
- Product dimensions: `productLine`, `brand`
- Field force dimensions: `medicalRep`, `manager`
- Customer/channel dimensions: `customerType`, `channel`
- Measures: `sales`, `target`, `forecast`, `units`, `customers`, `activeCustomers`, `calls`, `plannedCalls`, `prescriptions`, `imsSales`, `marketSize`, `competitorA`, `competitorB`, `competitorC`, `margin`

`lib/supabase.ts` includes a PostgreSQL table schema for replacing the sample generator with Supabase-backed facts.

## API Example

```text
/api/commercial?year=2026&region=North&brand=Cardiovex
```

The endpoint returns filtered KPIs, chart series, alerts, and insights in a structure ready for a BI data service or Supabase query adapter.
