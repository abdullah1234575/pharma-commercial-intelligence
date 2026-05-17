import { createClient } from "@supabase/supabase-js";

export type CommercialFactRow = {
  id: string;
  period_date: string;
  region: string;
  territory: string;
  product_line: string;
  brand: string;
  medical_rep: string;
  manager: string;
  customer_type: string;
  channel: string;
  sales: number;
  target: number;
  forecast: number;
  units: number;
  active_customers: number;
  calls: number;
  planned_calls: number;
  market_size: number;
  contribution_margin: number;
};

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey);
}

export const samplePostgresSchema = `
create table commercial_facts (
  id uuid primary key default gen_random_uuid(),
  period_date date not null,
  year int generated always as (extract(year from period_date)::int) stored,
  quarter text not null,
  month text not null,
  region text not null,
  territory text not null,
  product_line text not null,
  brand text not null,
  medical_rep text not null,
  manager text not null,
  customer_type text not null,
  channel text not null,
  sales numeric(14,2) not null,
  target numeric(14,2) not null,
  forecast numeric(14,2) not null,
  units int not null,
  customers int not null,
  active_customers int not null,
  calls int not null,
  planned_calls int not null,
  prescriptions int not null,
  ims_sales numeric(14,2) not null,
  market_size numeric(14,2) not null,
  contribution_margin numeric(14,2) not null,
  created_at timestamptz default now()
);
`;
