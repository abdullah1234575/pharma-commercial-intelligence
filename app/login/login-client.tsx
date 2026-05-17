"use client";

import { useMemo, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { getSupabaseClient, supabaseConfigured } from "@/lib/supabase";

export function LoginClient() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              workspace_name: workspaceName || "Synaptic Group Workspace",
              role: "owner"
            }
          }
        });
        if (error) throw error;
        setMessage("Account created. Check email confirmation if enabled in Supabase.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Signed in successfully. The dashboard can now load your private workspace data.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--background))] px-4 py-8 text-[rgb(var(--text))]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-executive dark:shadow-executive-dark lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <BrandMark variant="login" />
            <div className="mt-12 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ocean">Secure Tenant Access</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">Pharma Commercial Intelligence</h1>
              <p className="mt-4 text-sm leading-6 text-[rgb(var(--muted))]">
                Multi-tenant workspace for private uploads, dynamic commercial analytics, saved dashboards, exports, and RBAC-controlled leadership views.
              </p>
            </div>
            <div className="mt-10 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex items-center gap-3 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
                <ShieldCheck className="h-4 w-4 text-mint" />
                Supabase Auth and row-level security
              </div>
              <div className="flex items-center gap-3 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
                <LockKeyhole className="h-4 w-4 text-ocean" />
                Isolated workspace data per tenant
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="mx-auto max-w-sm">
              <div className="mb-6 grid grid-cols-2 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-1">
                <button className={`h-9 rounded-md text-sm font-semibold ${mode === "signin" ? "bg-[rgb(var(--panel))] shadow-sm" : "text-[rgb(var(--muted))]"}`} onClick={() => setMode("signin")}>
                  Login
                </button>
                <button className={`h-9 rounded-md text-sm font-semibold ${mode === "signup" ? "bg-[rgb(var(--panel))] shadow-sm" : "text-[rgb(var(--muted))]"}`} onClick={() => setMode("signup")}>
                  Signup
                </button>
              </div>
              <h2 className="text-xl font-semibold">{mode === "signin" ? "Sign in" : "Create workspace"}</h2>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                {supabaseConfigured ? "Use your organization credentials." : "Local preview mode. Configure Supabase env vars for live auth."}
              </p>
              <form className="mt-8 space-y-4" onSubmit={submit}>
                {mode === "signup" ? (
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">Workspace name</span>
                    <input
                      className="h-11 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                      placeholder="Company commercial workspace"
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                    />
                  </label>
                ) : null}
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
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">Password</span>
                  <input
                    className="h-11 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                    placeholder="Enter password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ocean px-4 text-sm font-semibold text-white transition hover:bg-aqua" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : mode === "signin" ? "Continue" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              {message ? <p className="mt-4 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3 text-sm leading-5">{message}</p> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
