"use server";

import { cookies } from "next/headers";
import { AuthenticationResult } from "@jellyfin/sdk/lib/generated-client/models";

// --- Types ---
export interface LoginPreferences {
  username?: string;
  serverUrl?: string;
}

export interface AuthData {
  serverUrl: string;
  user: AuthenticationResult & { AccessToken: string };
  timestamp: number;
}

// --- StoreServerURL actions ---
const SERVER_URL_KEY = "jellyfin-server-url";

export async function setServerUrl(value: string) {
  (await cookies()).set(SERVER_URL_KEY, value);
}

export async function getServerUrl(): Promise<string | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get(SERVER_URL_KEY);
  return val ? val.value : null;
}

export async function removeServerUrl() {
  (await cookies()).delete(SERVER_URL_KEY);
}

// --- StoreLoginPreferences actions ---
const PREF_KEY = "login-preferences";

export async function setLoginPreferences(value: LoginPreferences) {
  (await cookies()).set(PREF_KEY, JSON.stringify(value));
}

export async function getLoginPreferences(): Promise<LoginPreferences | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PREF_KEY);
  if (!raw || !raw.value) return null;
  try {
    return JSON.parse(raw.value) as LoginPreferences;
  } catch {
    return null;
  }
}

export async function removeLoginPreferences() {
  (await cookies()).delete(PREF_KEY);
}

// --- StoreAuthData actions ---
const AUTH_DATA_KEY = "jellyfin-auth";

export async function setAuthData(value: AuthData) {
  (await cookies()).set(AUTH_DATA_KEY, JSON.stringify(value));
}

export async function getAuthData(): Promise<AuthData | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get(AUTH_DATA_KEY);
  if (!val || !val.value) return null;

  try {
    const parsed = JSON.parse(val.value);
    return parsed as AuthData;
  } catch {
    return null;
  }
}

export async function removeAuthData() {
  (await cookies()).delete(AUTH_DATA_KEY);
}
