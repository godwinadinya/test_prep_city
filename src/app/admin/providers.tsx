"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { api, ApiError } from "@/lib/api";
import { clearSession } from "@/lib/auth-storage";

export function AdminProviders({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <SWRConfig
      value={{
        fetcher: (path: string) => api(path),
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        onError: (e) => {
          if (e instanceof ApiError && e.status === 401) {
            clearSession();
            router.replace("/login");
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}