import type { ButtonHTMLAttributes } from "react";

export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg role="status" aria-label="Loading" viewBox="0 0 24 24" width={size} height={size} fill="none" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
};

export function LoadingButton({ loading = false, loadingText, children, className = "", disabled, ...rest }: LoadingButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-60 ${className}`}
    >
      {loading ? <Spinner size={16} /> : null}
      {loading ? loadingText ?? children : children}
    </button>
  );
}

export function PageLoader({ label = "Loading…", fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <div className={`grid place-items-center ${fullScreen ? "min-h-screen" : "min-h-[40vh]"}`}>
      <div className="flex flex-col items-center gap-3 text-navy-900 dark:text-gold-500">
        <Spinner size={32} />
        <p className="text-sm text-neutral-600 dark:text-white/70">{label}</p>
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-navy-100 dark:bg-white/10 ${className}`} />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}