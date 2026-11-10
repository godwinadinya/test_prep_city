import { api, ApiError } from "./api";
import { saveSession, type Session } from "./auth-storage";
import { decodeJwt } from "./jwt";

export const AUTH = {
  login: "/api/v1/auth/login/",           // for students and super admin
  loginOtp: "/api/v1/auth/login/otp/",
  register: "/api/v1/auth/register/",
    otpRequest: "/api/v1/auth/otp/request/",

};

export async function requestRegisterOtp(identifier: string) {
  await api(AUTH.otpRequest, {
    method: "POST",
    auth: false,
    body: JSON.stringify({ identifier, purpose: "register" }),
  });
}

export type RegisterInput = {
  identifier: string;
  code: string;
  name: string;
  dateOfBirth: string;
  state: string;
  school: string;
  examYear: number;
  password: string;
  acceptTerms: boolean;
  marketingOptIn: boolean;
  guardianName?: string;
  guardianContact?: string;
};

function toSession(data: any, identifier?: string): Session {
  const access = data?.access ?? data?.access_token ?? data?.token;
  if (!access) throw new ApiError(0, "Unexpected response from the server.", data);

  const claims = decodeJwt<{ role?: string; user_id?: string | number }>(access);
  const role = data?.user?.role ?? data?.role ?? claims?.role;
  if (!role) throw new ApiError(0, "Unexpected response from the server.", data);

  return {
    access,
    refresh: data?.refresh ?? data?.refresh_token,
    user: {
      id: data?.user?.id ?? claims?.user_id,
      email: data?.user?.email ?? (identifier?.includes("@") ? identifier : undefined),
      name: data?.user?.full_name ?? data?.user?.name,
      role,
    },
  };
}

export async function loginWithPassword(identifier: string, password: string) {
  const data = await api<unknown>(AUTH.login, {
    method: "POST",
    auth: false,
    body: JSON.stringify({ identifier, password }),
  });
  const session = toSession(data, identifier);
  saveSession(session);
  return session;
}

export async function registerStudent(i: RegisterInput): Promise<{ signedIn: boolean }> {
  const data = await api<unknown>(AUTH.register, {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      identifier: i.identifier,
      code: i.code,
      name: i.name,
      date_of_birth: i.dateOfBirth,
      state: i.state,
      school: i.school,
      exam_year: i.examYear,
      password: i.password,
      accept_terms: i.acceptTerms,
      marketing_opt_in: i.marketingOptIn,
      guardian_name: i.guardianName ?? "",
      guardian_contact: i.guardianContact ?? "",
    }),
  });

  // If register returns tokens, use them. Otherwise try a normal login.
  try {
    saveSession(toSession(data, i.identifier));
    return { signedIn: true };
  } catch {}
  try {
    await loginWithPassword(i.identifier, i.password);
    return { signedIn: true };
  } catch {
    return { signedIn: false }; // e.g. a minor still waiting for guardian consent
  }
}
