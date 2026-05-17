import Image from "next/image";
import { clsx } from "clsx";

type BrandMarkProps = {
  variant?: "sidebar" | "navbar" | "login";
  compact?: boolean;
  logoSrc?: string;
};

const logoSize = {
  sidebar: "h-14 w-14",
  navbar: "h-9 w-9",
  login: "h-16 w-16"
};

export function BrandMark({ variant = "navbar", compact = false, logoSrc = "/synaptic-group-logo.png" }: BrandMarkProps) {
  return (
    <div className={clsx("flex min-w-0 items-center", variant === "login" ? "gap-4" : "gap-3")}>
      <div
        className={clsx(
          "relative shrink-0 overflow-hidden rounded-lg border border-white/20 bg-[rgb(var(--panel-soft))] shadow-sm ring-1 ring-black/5 dark:ring-white/10",
          logoSize[variant]
        )}
      >
        <Image
          src={logoSrc}
          alt="Synaptic Group logo"
          fill
          priority={variant !== "navbar"}
          sizes={variant === "login" ? "64px" : variant === "sidebar" ? "56px" : "36px"}
          className="object-cover"
        />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className={clsx("truncate font-semibold text-[rgb(var(--text))]", variant === "login" ? "text-xl" : "text-base")}>
            Synaptic Group
          </p>
          <p className="truncate text-xs font-medium uppercase tracking-[0.1em] text-[rgb(var(--muted))]">
            Powered by Abdullah Alshawadfy
          </p>
        </div>
      ) : null}
    </div>
  );
}
