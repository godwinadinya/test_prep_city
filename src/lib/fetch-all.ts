import { api } from "./api";
import type { Paginated } from "./admin-types";

export type AllPages<T> = { items: T[]; truncated: boolean };

// Follows the pagination until the end. `path` should already include page_size=100.
export async function fetchAllPages<T>(path: string, maxPages = 10): Promise<AllPages<T>> {
  const sep = path.includes("?") ? "&" : "?";
  const items: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await api<Paginated<T>>(`${path}${sep}page=${page}`);
    items.push(...res.results);
    if (!res.next) return { items, truncated: false };
  }
  return { items, truncated: true };
}