export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type UserStatus = "active" | "pending_consent" | "suspended" | "deleted";

export type AdminUser = {
  id: string;
  role: string; // "student" | "super_admin"
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

export type AdminClaim = {
  id: string;
  payment_reference: string;
  student: string;
  amount_kobo: number;
  sender_name: string;
  submitted_reference: string;
  proof_key: string;
  note: string;
  status: string;
  reviewed_at: string | null;
  reject_reason: string;
  created_at: string;
};

export type Plan = {
  id: string;
  code: string;
  name: string;
  tier: "free" | "monthly" | "yearly";
  price_kobo: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
};

export type PromoCode = {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_kobo: number | null;
  max_redemptions: number | null;
  redeemed_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  plans: string[];
};

export type AdminPayment = {
  id: string;
  reference: string;
  user: string;
  user_name: string;
  plan_name: string;
  method: string;
  status: string;
  amount_kobo: number;
  discount_kobo: number;
  paid_at: string | null;
  created_at: string;
  failure_reason: string;
};

export type Refund = {
  id: string;
  payment: string;
  amount_kobo: number;
  reason: string;
  status: string;
  requested_by: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
};

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

// The API sends money in kobo.
export const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

export type XpRule = {
  id: string;
  action: string;
  params: unknown;
  is_active: boolean;
  description: string;
};

export type Level = {
  id: string;
  number: number;
  name: string;
  tier: string;
  xp_threshold: number;
};

export type Badge = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  artwork_key: string;
  criteria_type: string;
  criteria_params: unknown;
  is_active: boolean;
};

export type IntegrityFlag = {
  id: string;
  user: string;
  nickname: string;
  reason: string;
  evidence: unknown;
  status: string;
  reviewed_by: string | null;
  created_at: string;
};


export type Subject = {
  id: string;
  code: string;
  name: string;
  is_compulsory: boolean;
  is_active: boolean;
  calculator_permitted: boolean;
  sort_order: number;
  track: string;
};

export type Topic = {
  id: string;
  title: string;
  syllabus_ref: string;
  sort_order: number;
  is_active: boolean;
  subject: string;
};

export type LessonStatus = "draft" | "published" | "archived";

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  duration_seconds: number;
  status: LessonStatus;
  is_free_sample: boolean;
  sort_order: number;
  published_at: string | null;
  topic: string;
  subtopic: string | null;
};

export type QuestionStatus = "draft" | "in_review" | "approved" | "retired";
export type Difficulty = "easy" | "medium" | "hard";

export type Question = {
  id: string;
  topic_id: string;
  stem: string;
  hint: string;
  explanation: string;
  difficulty: Difficulty;
  correct_label: string;
  status: QuestionStatus;
  version: number;
  source: string;
  options: { label: string; text: string }[];
  author: string | null;
  reviewer: string | null;
  approver: string | null;
  approved_at: string | null;
  times_answered: number;
  times_correct: number;
  report_count: number;
  created_at: string;
};

export type FreeEvent = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  location: string;
  link: string;
  is_published: boolean;
};