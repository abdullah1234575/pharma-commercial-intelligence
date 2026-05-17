import { getSupabaseClient } from "@/lib/supabase";
import type { PharmaRecord, UploadHistoryItem } from "@/types/dashboard";

function periodDate(record: PharmaRecord) {
  return `${record.year}-${String(record.monthIndex + 1).padStart(2, "0")}-01`;
}

export async function persistUploadToSupabase(item: UploadHistoryItem, records: PharmaRecord[]) {
  const supabase = getSupabaseClient();
  if (!supabase || !records.length) return { persisted: false, reason: "Supabase is not configured or no rows were processed." };

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { persisted: false, reason: "No authenticated Supabase user." };

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return { persisted: false, reason: "No workspace membership found for this user." };
  }

  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .insert({
      workspace_id: membership.workspace_id,
      user_id: user.id,
      file_name: item.fileName,
      sheet_count: item.sheets,
      row_count: item.rows,
      status: item.status,
      mapping_summary: { message: item.message }
    })
    .select("id")
    .single();

  if (uploadError || !upload) {
    return { persisted: false, reason: uploadError?.message ?? "Upload insert failed." };
  }

  const rows = records.map((record) => ({
    workspace_id: membership.workspace_id,
    upload_id: upload.id,
    user_id: user.id,
    period_date: periodDate(record),
    year: record.year,
    quarter: record.quarter,
    month: record.month,
    region: record.region,
    territory: record.territory,
    product_line: record.productLine,
    brand: record.brand,
    medical_rep: record.medicalRep,
    manager: record.manager,
    customer_type: record.customerType,
    channel: record.channel,
    sales: record.sales,
    target: record.target,
    forecast: record.forecast,
    units: record.units,
    customers: record.customers,
    active_customers: record.activeCustomers,
    calls: record.calls,
    planned_calls: record.plannedCalls,
    prescriptions: record.prescriptions,
    ims_sales: record.imsSales,
    market_size: record.marketSize,
    contribution_margin: record.margin,
    raw_payload: record
  }));

  for (let index = 0; index < rows.length; index += 500) {
    const { error } = await supabase.from("processed_data").insert(rows.slice(index, index + 500));
    if (error) return { persisted: false, reason: error.message };
  }

  return { persisted: true, reason: "Upload persisted to Supabase processed_data." };
}
