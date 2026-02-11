import { StoreSeerrData } from "./store/store-seerr-data";
import type { SeerrAuthData } from "./store/server-actions";
import {
  SeerrMediaItem,
  SeerrRequestItem,
  User,
} from "@/src/types/seerr-types";

async function getHeaders(): Promise<HeadersInit> {
  const data = await StoreSeerrData.get();
  if (!data?.serverUrl) return {};

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-seerr-url": data.serverUrl,
  };

  if (data.authType === "api-key" && data.apiKey) {
    headers["x-api-key"] = data.apiKey;
  } else if (
    (data.authType === "local-user" || data.authType === "jellyfin-user") &&
    data.username &&
    data.password
  ) {
    headers["x-seerr-auth-type"] = data.authType;
    headers["x-seerr-username"] = data.username;
    headers["x-seerr-password"] = data.password;
  }
  return headers;
}

async function internalFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const headers = await getHeaders();

    const finalHeaders = { ...headers, ...(options.headers || {}) };

    const response = await fetch(`/api/seerr${endpoint}`, {
      ...options,
      headers: finalHeaders,
      credentials: "include",
    });

    if (response.status === 204) return { success: true };

    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json };
    }

    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        return { success: false, message: errorJson.message };
      }
    } catch (e) {}

    return {
      success: false,
      message: `Request failed: ${response.status} ${response.statusText}`,
    };
  } catch (error) {
    console.error("Seerr Internal Fetch Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function getSeerrRecentlyAddedItems(): Promise<{
  results: SeerrMediaItem[];
  pageInfo?: any;
} | null> {
  const response = await internalFetch<{
    results: SeerrMediaItem[];
    pageInfo?: any;
  }>("/recently-added");
  if (response.success && response.data) return response.data;
  return null;
}

export async function getSeerrTrendingItems(): Promise<{
  results: SeerrMediaItem[];
  pageInfo?: any;
} | null> {
  const response = await internalFetch<{
    results: SeerrMediaItem[];
    pageInfo?: any;
  }>("/trending");
  if (response.success && response.data) return response.data;
  return null;
}

export async function getSeerrPopularMovies(): Promise<{
  results: SeerrMediaItem[];
  pageInfo?: any;
} | null> {
  const response = await internalFetch<{
    results: SeerrMediaItem[];
    pageInfo?: any;
  }>("/popular-movies");
  if (response.success && response.data) return response.data;
  return null;
}

export async function getSeerrPopularTv(): Promise<{
  results: SeerrMediaItem[];
  pageInfo?: any;
} | null> {
  const response = await internalFetch<{
    results: SeerrMediaItem[];
    pageInfo?: any;
  }>("/popular-tv");
  if (response.success && response.data) return response.data;
  return null;
}

export async function getSeerrRecentRequests(): Promise<{
  results: SeerrRequestItem[];
  pageInfo?: any;
} | null> {
  const response = await internalFetch<{
    results: SeerrRequestItem[];
    pageInfo?: any;
  }>("/recent-requests");
  if (response.success && response.data) return response.data;
  return null;
}

export async function getSeerrDiscovery(): Promise<{
  recent: { results: SeerrMediaItem[] } | null;
  trending: { results: SeerrMediaItem[] } | null;
  popularMovies: { results: SeerrMediaItem[] } | null;
  popularTv: { results: SeerrMediaItem[] } | null;
  recentRequests: { results: SeerrRequestItem[] } | null;
} | null> {
  const response = await internalFetch<any>("/discover");
  if (response.success && response.data) return response.data;
  return null;
}

export async function getSeerrUser(): Promise<User | null> {
  const response = await internalFetch<User>("/auth/me");
  if (response.success && response.data) return response.data;
  return null;
}

export async function searchSeerrItems(
  query: string,
): Promise<SeerrMediaItem[]> {
  const response = await internalFetch<SeerrMediaItem[]>(
    `/search?query=${encodeURIComponent(query)}`,
  );
  if (response.success && response.data) return response.data;
  return [];
}

export async function getSeerrMediaDetails(
  type: "movie" | "tv",
  tmdbId: number,
): Promise<any | null> {
  const response = await internalFetch<any>(`/details/${type}/${tmdbId}`);
  if (response.success && response.data) return response.data;
  return null;
}

export async function getRadarrSettings(): Promise<any[] | null> {
  const response = await internalFetch<any[]>("/settings/radarr");
  if (response.success && response.data) return response.data;
  return null;
}

export async function getRadarrProfiles(
  radarrId: number,
): Promise<any[] | null> {
  const response = await internalFetch<any[]>(
    `/settings/radarr/${radarrId}/profiles`,
  );
  if (response.success && response.data) return response.data;
  return null;
}

export async function getSonarrSettings(): Promise<any[] | null> {
  const response = await internalFetch<any[]>("/settings/sonarr");
  if (response.success && response.data) return response.data;
  return null;
}

export async function getSonarrProfiles(
  sonarrId: number,
): Promise<any[] | null> {
  const response = await internalFetch<any[]>(
    `/settings/sonarr/${sonarrId}/profiles`,
  );
  if (response.success && response.data) return response.data;
  return null;
}

export async function submitSeerrRequest(payload: any): Promise<any | null> {
  const response = await internalFetch("/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response.success && response.data) return response.data;
  return null;
}

export async function deleteSeerrRequest(requestId: number): Promise<boolean> {
  const response = await internalFetch(`/request/${requestId}`, {
    method: "DELETE",
  });
  return response.success;
}

export async function approveSeerrRequest(requestId: number): Promise<boolean> {
  const response = await internalFetch(`/request/${requestId}/approve`, {
    method: "POST",
  });
  return response.success;
}

export async function declineSeerrRequest(requestId: number): Promise<boolean> {
  const response = await internalFetch(`/request/${requestId}/decline`, {
    method: "POST",
  });
  return response.success;
}

export async function testSeerrConnection(
  config?: SeerrAuthData,
): Promise<{ success: boolean; message?: string }> {
  let headers: HeadersInit = { "Content-Type": "application/json" };
  let body: any = {};
  const currentConfig = config || (await StoreSeerrData.get());

  if (currentConfig) {
    if (currentConfig.serverUrl)
      headers["x-seerr-url"] = currentConfig.serverUrl;

    if (currentConfig.authType === "api-key") {
      if (currentConfig.apiKey) {
        headers["x-api-key"] = currentConfig.apiKey;
      }
      body = {
        authType: currentConfig.authType,
      };
    } else {
      body = {
        authType: currentConfig.authType,
        username: currentConfig.username,
        password: currentConfig.password,
      };
    }
  }

  try {
    const response = await fetch("/api/seerr/test-connection", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include",
    });

    if (response.ok) {
      const json = await response.json();
      return {
        success: true,
        message: json.message || "Connection successful",
      };
    }

    const json = await response.json();
    return { success: false, message: json.message || "Connection failed" };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}
