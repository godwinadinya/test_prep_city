import type { ReactNode } from "react";
import { ApiError } from "@/lib/api";

export function DataState(props: {
  loading: boolean;
  error: unknown;
  empty: boolean;
  emptyText?: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  const { loading, error, empty, emptyText = "Nothing here yet.", onRetry, children } = props;

  if (loading) {
    return (
      <p className="text-sm text-neutral-500 dark:text-white/60">
        Loading… The first load can take up to a minute if the server is asleep.
      </p>
    );
  }
  if (error) {
    return (
      <div>
        <p className="font-bold">Couldn&apos;t load this.</p>
        <p className="text-sm text-neutral-500 dark:text-white/60">
          {error instanceof ApiError ? error.message : "Please try again."}
        </p>
        <button type="button" onClick={onRetry} className="btn-ghost mt-3 px-3 py-2 text-sm">Try again</button>
      </div>
    );
  }
  if (empty) return <p className="text-sm text-neutral-500 dark:text-white/60">{emptyText}</p>;
  return <>{children}</>;
}