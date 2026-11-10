"use client";

import { useState } from "react";
import useSWR from "swr";
import type { Paginated } from "@/lib/admin-types";
import { useDebounced } from "./use-debounced";

type Filters = Record<string, string | undefined>;

// `path` must be the endpoint with its trailing slash, e.g. "/api/v1/admin/users/"
export function usePagedList<T>(path: string, opts: { pageSize?: number; filters?: Filters } = {}) {
  const pageSize = opts.pageSize ?? 20;
  const [page, setPage] = useState(1);
  const [search, setSearchRaw] = useState("");
  const [filters, setFilters] = useState<Filters>(opts.filters ?? {});
  const q = useDebounced(search.trim(), 350);

  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (q) params.set("search", q);
  for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);

  const swr = useSWR<Paginated<T>>(`${path}?${params.toString()}`, { keepPreviousData: true });
  const total = swr.data?.count ?? 0;

  return {
    ...swr,
    rows: swr.data?.results ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    hasPrev: !!swr.data?.previous,
    hasNext: !!swr.data?.next,
    setPage,
    search,
    setSearch: (v: string) => {
      setSearchRaw(v);
      setPage(1);
    },
    filters,
    setFilter: (key: string, value: string) => {
      setFilters((f) => ({ ...f, [key]: value }));
      setPage(1);
    },
  };
}