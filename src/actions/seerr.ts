import { StoreSeerrData, type SeerrAuthData } from "./store/store-seerr-data";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { isTauri } from "@tauri-apps/api/core";

function normalizeServerUrl(url: string): string {
  let baseUrl = url.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`;
  }
  return baseUrl;
}

function configureProxy(
  baseUrl: string,
  headers: Record<string, string>,
): string {
  if (!isTauri()) {
    console.debug("Using Proxy for Seerr API");
    headers["X-Proxy-Target"] = baseUrl;
    return import.meta.env.VITE_PROXY_URL || "http://localhost:3001";
  }
  return baseUrl;
}

function buildRequestConfig(data: SeerrAuthData): {
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body?: Record<string, any>;
  error?: string;
} {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
  };
  let endpoint = "";
  let method = "GET";
  let body: Record<string, any> | undefined;

  switch (data.authType) {
    case "api-key":
      if (!data.apiKey)
        return { endpoint, method, headers, error: "API Key is missing" };
      endpoint = "/api/v1/auth/me";
      headers["X-Api-Key"] = data.apiKey;
      break;

    case "local-user":
      if (!data.username || !data.password)
        return {
          endpoint,
          method,
          headers,
          error: "Username or Password missing",
        };
      endpoint = "/api/v1/auth/local";
      body = { email: data.username, password: data.password };
      method = "POST";
      break;

    case "jellyfin-user":
      if (!data.username || !data.password)
        return {
          endpoint,
          method,
          headers,
          error: "Jellyfin Credentials missing (Username/Password required)",
        };
      endpoint = "/api/v1/auth/jellyfin";
      body = { username: data.username, password: data.password };
      method = "POST";
      break;

    default:
      return {
        endpoint,
        method,
        headers,
        error: "Unknown Authentication Type",
      };
  }

  return { endpoint, method, headers, body };
}

export async function seerrFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const data = await StoreSeerrData.get();
    if (!data?.serverUrl) {
      return { success: false, message: "No Server URL configured" };
    }

    const {
      endpoint: authEndpoint, // unused here, but part of destructuring
      method: authMethod, // unused here
      headers,
      body, // unused here
      error,
    } = buildRequestConfig(data);

    if (error) return { success: false, message: error };

    let baseUrl = normalizeServerUrl(data.serverUrl);
    baseUrl = configureProxy(baseUrl, headers);

    const fullUrl = `${baseUrl}${endpoint}`;

    // Merge custom options
    const finalHeaders = { ...headers, ...(options.headers || {}) };
    const fetchFn = isTauri() ? tauriFetch : fetch;

    const response = await fetchFn(fullUrl, {
      ...options,
      headers: finalHeaders,
      // @ts-ignore
      credentials: "include",
    });

    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Authentication failed: Invalid credentials",
      };
    }

    return {
      success: false,
      message: `Request failed: ${response.status} ${response.statusText}`,
    };
  } catch (error) {
    console.error("Seerr Fetch Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network error or unreachable host",
    };
  }
}

// Helper to hydrate items with full details
async function hydrateSeerrItems(results: any[]) {
  return Promise.all(
    results.map(async (item: any) => {
      if (!item.tmdbId || !item.mediaType) return item;

      const detailEndpoint = `/api/v1/${item.mediaType}/${item.tmdbId}`;
      const detailResponse = await seerrFetch<any>(detailEndpoint);

      if (detailResponse.success && detailResponse.data) {
        // Merge details into the main item
        return { ...item, ...detailResponse.data };
      }
      return item;
    }),
  );
}

export async function getSeerrRecentlyAddedItems(): Promise<{
  results: any[];
  pageInfo?: any;
} | null> {
  const response = await seerrFetch<{ results: any[]; pageInfo?: any }>(
    "/api/v1/media?filter=allavailable&take=20&sort=mediaAdded",
    {
      method: "GET",
    },
  );

  if (response.success && response.data) {
    const hydratedResults = await hydrateSeerrItems(response.data.results);
    return { ...response.data, results: hydratedResults };
  }

  console.error("Failed to fetch recently added items:", response.message);
  return null;
}

export async function getSeerrTrendingItems(): Promise<{
  results: any[];
  pageInfo?: any;
} | null> {
  const response = await seerrFetch<{ results: any[]; pageInfo?: any }>(
    "/api/v1/discover/trending?page=1",
    { method: "GET" },
  );

  if (response.success && response.data) {
    const hydratedResults = await hydrateSeerrItems(response.data.results);
    return { ...response.data, results: hydratedResults };
  }

  console.error("Failed to fetch trending items:", response.message);
  return null;
}

import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

export function mapSeerrItemsToBaseItemDto(items: any[]): BaseItemDto[] {
  return items.map((item) => ({
    Id: String(item.jellyfinMediaId || item.id), // Use jellyfin ID if linked, else Seerr ID
    Name: item.title || item.name || "Unknown Title",
    Type: item.mediaType === "movie" ? "Movie" : "Series",
    // @ts-ignore - Custom property handled in MediaCard
    ExternalPosterUrl: item.posterPath
      ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
      : null,
    RunTimeTicks: 0,
    ProductionYear: item.releaseDate
      ? new Date(item.releaseDate).getFullYear()
      : undefined,
    PremiereDate: item.releaseDate,
    CommunityRating: item.voteAverage,
  }));
}

export async function testSeerrConnection(
  config?: SeerrAuthData,
): Promise<{ success: boolean; message?: string }> {
  try {
    const data = config || (await StoreSeerrData.get());
    if (!data?.serverUrl) {
      return { success: false, message: "No Server URL configured" };
    }

    const { endpoint, method, headers, body, error } = buildRequestConfig(data);
    if (error) return { success: false, message: error };

    let baseUrl = normalizeServerUrl(data.serverUrl);
    baseUrl = configureProxy(baseUrl, headers);

    const fullUrl = `${baseUrl}${endpoint}`;
    console.debug(`[Seerr] Testing connection: ${method} ${fullUrl}`, {
      authType: data.authType,
      env: isTauri() ? "Tauri" : "Web",
    });

    const fetchFn = isTauri() ? tauriFetch : fetch;
    const response = await fetchFn(fullUrl, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.ok) {
      return {
        success: true,
        message: `Connection successful via ${data.authType.replace("-", " ")}`,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Authentication failed: Invalid credentials",
      };
    }

    return {
      success: false,
      message: `Connection failed: ${response.status} ${response.statusText}`,
    };
  } catch (error) {
    console.error("Seerr Connection Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network error or unreachable host",
    };
  }
}
