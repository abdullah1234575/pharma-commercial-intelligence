import { createClient } from "@supabase/supabase-js";

export type UserRole = "owner" | "admin" | "analyst" | "viewer";

export type CommercialFactRow = {
  id: string;
  workspace_id: string;
  upload_id: string;
  user_id: string;
  period_date: string;
  year: number;
  quarter: string;
  month: string;
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
  customers: number;
  active_customers: number;
  calls: number;
  planned_calls: number;
  prescriptions: number;
  ims_sales: number;
  market_size: number;
  contribution_margin: number;
  raw_payload: Record<string, unknown>;
};

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 5
      }
    }
  });
}

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
