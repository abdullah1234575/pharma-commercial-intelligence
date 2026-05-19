"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { getSupabaseClient } from "@/lib/supabase";

type ProfileData = {
  fullName: string;
  email: string;
  company: string;
  verified: boolean;
  uploadCount: number;
  exportCount: number;
  lastActive: string | null;
};

export function ProfileClient() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      setLoading(false);
      return;
    }

    async function loadProfile() {
      const client = supabase;
      if (!client) {
        setMessage("Supabase is not configured.");
        setLoading(false);
        return;
      }

      const { data } = await client.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        setMessage("You must sign in to view your profile.");
        setLoading(false);
        return;
      }

      const [{ data: userData, error: userError }, { count: uploadCount, error: uploadError }] = await Promise.all([
        supabase.from("users").select("full_name,email,company,verified,last_active").eq("id", user.id).single(),
        supabase.from("uploads").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      ]);

      if (userError) {
        setMessage(userError.message);
        setLoading(false);
        return;
      }

      if (uploadError) {
        console.warn("Upload count query failed", uploadError.message);
      }

      const exportCount = Number(window.localStorage.getItem("pci:export-count") ?? "0");

      setProfile({
        fullName: userData?.full_name || user.email || "Unknown",
        email: user.email || userData?.email || "Unknown",
        company: userData?.company || "Not provided",
        verified: Boolean(userData?.verified),
        uploadCount: uploadCount ?? 0,
        exportCount,
        lastActive: userData?.last_active ?? null
      });
      setLoading(false);
    }

    loadProfile().catch((error) => {
      setMessage(error instanceof Error ? error.message : "Profile load failed.");
      setLoading(false);
    });
  }, [supabase]);

  return (
    <main className="min-h-screen bg-[rgb(var(--background))] px-4 py-8 text-[rgb(var(--text))]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 shadow-executive dark:shadow-executive-dark sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandMark variant="login" />
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">
              A lightweight profile summary for verified users, upload activity, exports, and recent workspace metadata.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-4 text-sm font-semibold transition hover:border-ocean hover:text-ocean"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 shadow-executive dark:shadow-executive-dark">
          {loading ? (
            <p className="text-sm text-[rgb(var(--muted))]">Loading profile…</p>
          ) : message ? (
            <div className="rounded-3xl border border-signal/20 bg-signal/5 p-4 text-sm text-[rgb(var(--text))]">{message}</div>
          ) : profile ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold">Your profile</h1>
                  <p className="mt-2 text-sm text-[rgb(var(--muted))]">Verified user details, activity metrics, and recent export history.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-4 py-2 text-sm font-semibold text-[rgb(var(--muted))]">
                  <ShieldCheck className="h-4 w-4 text-mint" />
                  {profile.verified ? "Email verified" : "Verification pending"}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">Name</p>
                  <p className="mt-3 text-lg font-semibold">{profile.fullName}</p>
                </div>
                <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">Email</p>
                  <p className="mt-3 text-lg font-semibold">{profile.email}</p>
                </div>
                <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">Company</p>
                  <p className="mt-3 text-lg font-semibold">{profile.company}</p>
                </div>
                <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">Last activity</p>
                  <p className="mt-3 text-lg font-semibold">{profile.lastActive ? new Date(profile.lastActive).toLocaleString() : "Not available"}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">Upload count</p>
                  <p className="mt-3 text-4xl font-semibold">{profile.uploadCount}</p>
                </div>
                <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">Export count</p>
                  <p className="mt-3 text-4xl font-semibold">{profile.exportCount}</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
