import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import { sendAdminLeadNotification } from "@/lib/lead-notification";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.fullName !== "string") {
    return NextResponse.json({ error: "Missing lead payload." }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 500 });
  }

  const payload = {
    email: body.email.trim(),
    full_name: body.fullName.trim(),
    company: body.company?.trim() || null,
    phone: body.phone?.trim() || null,
    source: body.source?.trim() || "Website signup",
    verified: Boolean(body.verified),
    export_count: typeof body.exportCount === "number" ? body.exportCount : 0,
    event: body.event === "export" ? "export" : "signup",
    last_active: body.lastActive || null,
    user_id: body.userId || null
  } as const;

  if (payload.user_id) {
    await supabase.from("users").upsert({
      id: payload.user_id,
      email: payload.email,
      full_name: payload.full_name,
      company: payload.company,
      phone: payload.phone,
      source: payload.source,
      verified: payload.verified,
      last_active: payload.last_active
    });
  }

  await supabase.from("user_leads").insert({
    user_id: payload.user_id,
    email: payload.email,
    full_name: payload.full_name,
    company: payload.company,
    phone: payload.phone,
    source: payload.source,
    verified: payload.verified,
    last_active: payload.last_active,
    export_count: payload.export_count
  });

  await sendAdminLeadNotification({
    fullName: payload.full_name,
    email: payload.email,
    company: payload.company ?? undefined,
    phone: payload.phone ?? undefined,
    source: payload.source ?? undefined,
    verified: payload.verified,
    timestamp: new Date().toISOString(),
    userId: payload.user_id ?? undefined,
    exportCount: payload.export_count,
    event: payload.event
  });

  return NextResponse.json({ success: true });
}
