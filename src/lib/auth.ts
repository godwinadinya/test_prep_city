import { api, ApiError } from "./api";
import { saveSession, type Session } from "./auth-storage";
import { decodeJwt } from "./jwt";

export const AUTH = {
  login: "/api/v1/auth/login/",           // for students and super admin
  loginOtp: "/api/v1/auth/login/otp/",
  register: "/api/v1/auth/register/",
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

export async function registerStudent(input: {
  name: string; email: string; phone: string; password: string;
  dateOfBirth: string; guardianEmail: string; guardianConsent: boolean;
}) {

    const data = await api<unknown>(AUTH.register, {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      full_name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      password: input.password,
      date_of_birth: input.dateOfBirth || undefined,
      guardian_email: input.guardianEmail || undefined,
      guardian_consent: input.guardianConsent,
    }),
  });
  try { saveSession(toSession(data)); } catch {}
  return data;
}
