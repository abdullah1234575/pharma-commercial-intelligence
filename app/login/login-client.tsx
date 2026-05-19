"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { getSupabaseClient, supabaseConfigured } from "@/lib/supabase";

export function LoginClient() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [source] = useState("Website signup");
  const [workspaceName, setWorkspaceName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function notifyLead(userId?: string, verified = false) {
    try {
      await fetch("/api/auth/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          company,
          phone,
          source,
          userId,
          verified,
          lastActive: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn("Lead notification failed", error);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!supabase) {
      setMessage("Supabase credentials are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for live auth.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: fullName,
              company,
              phone,
              source,
              workspace_name: workspaceName || "Synaptic Group Workspace",
              role: "owner"
            }
          }
        });
        if (error) throw error;
        await notifyLead(data?.user?.id, false);
        setMessage("Account created. Check your email for verification. You will need to verify before premium exports.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) throw error;
        setMessage("If your email exists, a password reset link was sent.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Signed in successfully. Access to premium dashboard exports is enabled once your email is verified.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--background))] px-4 py-8 text-[rgb(var(--text))]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <section className="overflow-hidden rounded-[2rem] border border-[#0f4c4c]/30 bg-[#071f1f]/85 p-8 shadow-[0_30px_80px_rgba(15,76,76,0.24)] backdrop-blur-lg backdrop-saturate-150 dark:bg-[#031616]/90 dark:border-[#0b3f3f]/40 lg:p-12">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#0F4C4C] via-[#0B6E4F] to-[#8B6B2E] px-8 py-10 text-white shadow-[0_30px_80px_rgba(15,76,76,0.24)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_24%),_radial-gradient(circle_at_bottom_right,_rgba(139,107,46,0.18),_transparent_32%)]" />
            <div className="relative max-w-xl">
              <BrandMark variant="login" />
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100/85">Premium Pharma Analytics</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Pharma Commercial Intelligence</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-100/90 sm:text-lg">
                Advanced Pharma Analytics & Business Intelligence Platform Built by Abdullah Alshawadfy
              </p>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-emerald-100/80">
                Upload your pharma sales data, generate executive dashboards, analyze market performance, export professional reports, and transform raw data into strategic business insights.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-[#8b6b2e]/20">
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/80">Name</p>
                  <p className="mt-2 text-lg font-semibold">Abdullah Alshawadfy</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-[#8b6b2e]/20">
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/80">Title</p>
                  <p className="mt-2 text-lg font-semibold">Pharma Commercial Intelligence Specialist</p>
                  <p className="text-sm text-emerald-100/80">Business Analytics Consultant</p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                  <Youtube className="h-4 w-4" /> YouTube
                </a>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-4 text-sm text-cyan-100/95 ring-1 ring-white/15">✔ Pharma Analytics</div>
                <div className="rounded-3xl bg-white/10 p-4 text-sm text-cyan-100/95 ring-1 ring-white/15">✔ Market Intelligence</div>
                <div className="rounded-3xl bg-white/10 p-4 text-sm text-cyan-100/95 ring-1 ring-white/15">✔ Power BI Dashboards</div>
                <div className="rounded-3xl bg-white/10 p-4 text-sm text-cyan-100/95 ring-1 ring-white/15">✔ Excel Automation</div>
                <div className="rounded-3xl bg-white/10 p-4 text-sm text-cyan-100/95 ring-1 ring-white/15 sm:col-span-2">✔ Forecasting & KPI Analytics</div>
              </div>
            </div>
          </div>
        </section>
                        <section className="p-6 sm:p-8">
          <div className="mx-auto max-w-sm">
            <div className="mb-6 grid grid-cols-2 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-1">
              <button
                type="button"
                className={
                  mode === "signin"
                    ? "h-9 rounded-md text-sm font-semibold bg-[rgb(var(--panel))] shadow-sm"
                    : "h-9 rounded-md text-sm font-semibold text-[rgb(var(--muted))]"
                }
                onClick={() => setMode("signin")}
              >
                Login
              </button>
              <button
                type="button"
                className={
                  mode === "signup"
                    ? "h-9 rounded-md text-sm font-semibold bg-[rgb(var(--panel))] shadow-sm"
                    : "h-9 rounded-md text-sm font-semibold text-[rgb(var(--muted))]"
                }
                onClick={() => setMode("signup")}
              >
                Signup
              </button>
            </div>
            <h2 className="text-xl font-semibold">{mode === "signin" ? "Sign in" : "Create workspace"}</h2>
            <p className="mt-1 text-sm text-[rgb(var(--muted))]">
              {supabaseConfigured ? "Use your organization credentials." : "Local preview mode. Configure Supabase env vars for live auth."}
            </p>
            <form className="mt-8 space-y-4" onSubmit={submit}>
              {mode === "signup" && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">Full name</span>
                    <input
                      className="h-11 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">Company</span>
                    <input
                      className="h-11 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                      placeholder="Acme Pharmaceuticals"
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">Phone</span>
                    <input
                      className="h-11 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                      placeholder="Optional phone number"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">Workspace name</span>
                    <input
                      className="h-11 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                      placeholder="Company commercial workspace"
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                    />
                  </label>
                </>
              )}
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">Email</span>
                <input
                  className="h-11 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              {mode !== "reset" && (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">Password</span>
                  <input
                    className="h-11 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                    placeholder="Enter password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required={mode === "signin" || mode === "signup"}
                  />
                </label>
              )}
              <div className="flex items-center justify-between gap-3 text-sm text-[rgb(var(--muted))]">
                <span>{mode === "reset" ? "Reset your password with your account email." : "Secure email/password login."}</span>
                {mode === "signin" && (
                  <button type="button" className="font-semibold text-ocean transition hover:text-aqua" onClick={() => setMode("reset")}>Forgot password?</button>
                )}
              </div>
              <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ocean px-4 text-sm font-semibold text-white transition hover:bg-aqua" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : mode === "signin" ? "Continue" : mode === "signup" ? "Create account" : "Reset password"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            {message && <p className="mt-4 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3 text-sm leading-5">{message}</p>}
            <div className="mt-6 rounded-[1.5rem] border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-5">
              <div className="text-sm font-semibold text-[rgb(var(--text))]">Need Custom Pharma Analytics Solutions?</div>
              <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">Partner with a specialist to build tailored KPIs, forecast models, and executive reporting.</p>
              <a
                href="mailto:Abdullahalshawadfy410@gmail.com"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#102f5d] px-4 text-sm font-semibold text-white transition hover:bg-[#16447f]"
              >
                Book Consultation
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
