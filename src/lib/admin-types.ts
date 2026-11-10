export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type UserStatus = "active" | "pending_consent" | "suspended" | "deleted";

export type AdminUser = {
  id: string;
  role: string; // "student" | "super_admin" (tutor later)
  name: string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  is_active: boolean;
  date_of_birth: string | null;
  created_at: string;
  last_login: string | null;
};

export type AdminOverview = {
  students: number;
  signups_last_7d: number;
  dau: number;
  wau: number;
  mau: number;
  paid_subscribers: number;
  free_to_paid_conversion: number;
  revenue_kobo_total: number;
  mocks_completed: number;
};

// The API sends money in kobo.
export const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);