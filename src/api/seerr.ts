import express from "express";
import { SeerrMediaItem } from "../types/seerr";

const router = express.Router();
router.use(express.json());

// Shared map to track pending logins per user/server
const loginPromises = new Map<string, Promise<string | null>>();

async function seerrFetch<T>(
  req: express.Request,
  endpoint: string,
  options: RequestInit = {},
): Promise<{
  success: boolean;
  data?: T;
  message?: string;
  headers?: Headers;
}> {
  const serverUrl = req.headers["x-seerr-url"] as string;
  if (!serverUrl) {
    return { success: false, message: "No Server URL provided in headers" };
  }

  let baseUrl = serverUrl.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`;
  }
  const fullUrl = `${baseUrl}${endpoint}`;

  // Credentials for Auto-Login
  const username = req.headers["x-seerr-username"] as string;
  const password = req.headers["x-seerr-password"] as string;
  const authType = req.headers["x-seerr-auth-type"] as string;

  // Helper: Perform Request
  const makeRequest = async (cookie?: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (req.headers["x-api-key"]) {
      headers["X-Api-Key"] = req.headers["x-api-key"] as string;
    }
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    return fetch(fullUrl, { ...options, headers });
  };

  // Helper: Perform Login (Deduplicated via loginPromises)
  const performLogin = async (): Promise<string | null> => {
    try {
      const authEndpoint =
        authType === "jellyfin-user"
          ? "/api/v1/auth/jellyfin"
          : "/api/v1/auth/local";

      const body =
        authType === "jellyfin-user"
          ? { username, password }
          : { email: username, password };

      const response = await fetch(`${baseUrl}${authEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const setCookie = response.headers.getSetCookie
          ? response.headers.getSetCookie()
          : response.headers.get("set-cookie");

        if (Array.isArray(setCookie)) return setCookie.join("; ");
        return setCookie || null;
      }
    } catch (e) {
      console.error("[SeerrFetch] Auto-login error:", e);
    }
    return null;
  };

  try {
    // 1. Attempt Initial Request
    let response = await makeRequest(req.headers["cookie"] as string);

    // 2. Handle 401 with Auto-Login Retry
    if (response.status === 401 && username && password) {
      const loginKey = `${username}@${baseUrl}`;

      if (!loginPromises.has(loginKey)) {
        // Start new login if none pending
        loginPromises.set(
          loginKey,
          performLogin().finally(() => loginPromises.delete(loginKey)),
        );
      }

      // Wait for the pending login (ours or shared)
      const newCookie = await loginPromises.get(loginKey);

      if (newCookie) {
        response = await makeRequest(newCookie);
      }
    }

    // 3. Handle Response
    if (response.status === 204) {
      return { success: true, headers: response.headers };
    }

    if (response.ok) {
      const data = await response.json();
      return { success: true, data, headers: response.headers };
    }

    // Attempt to parse error message
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.message) errorMessage = errorJson.message;
    } catch {}

    return {
      success: false,
      message: errorMessage,
      headers: response.headers,
    };
  } catch (error) {
    console.error("Seerr Server Fetch Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

function normalizeSeerrItems(results: any[]): SeerrMediaItem[] {
  if (!Array.isArray(results)) return [];
  return results.map((item: any) => ({
    ...item,
    tmdbId: item.tmdbId || item.id,
  })) as SeerrMediaItem[];
}

async function hydrateSeerrItems(
  req: express.Request,
  results: any[],
): Promise<SeerrMediaItem[]> {
  return Promise.all(
    results.map(async (item: any) => {
      const tmdbId = item.tmdbId || item.id;
      if (!tmdbId) return item as SeerrMediaItem;

      const type = item.mediaType || "movie";
      const detailEndpoint = `/api/v1/${type}/${tmdbId}`;
      const detailResponse = await seerrFetch<any>(req, detailEndpoint);

      if (detailResponse.success && detailResponse.data) {
        let merged = { ...item, ...detailResponse.data };
        merged.tmdbId = tmdbId;
        return merged as SeerrMediaItem;
      }
      return item as SeerrMediaItem;
    }),
  );
}

router.get("/recently-added", async (req, res) => {
  const result = await seerrFetch<{ results: any[]; pageInfo?: any }>(
    req,
    "/api/v1/media?filter=allavailable&take=20&sort=mediaAdded",
    { method: "GET" },
  );

  if (result.success && result.data) {
    const hydrated = await hydrateSeerrItems(req, result.data.results);
    res.json({ ...result.data, results: hydrated });
  } else {
    res.status(500).json(result);
  }
});

router.get("/trending", async (req, res) => {
  const result = await seerrFetch<{ results: any[]; pageInfo?: any }>(
    req,
    "/api/v1/discover/trending?page=1",
    { method: "GET" },
  );

  if (result.success && result.data) {
    const normalized = normalizeSeerrItems(result.data.results);
    res.json({ ...result.data, results: normalized });
  } else {
    res.status(500).json(result);
  }
});

router.get("/popular-movies", async (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0];
  const result = await seerrFetch<{ results: any[]; pageInfo?: any }>(
    req,
    `/api/v1/discover/movies?page=1&primaryReleaseDateGte=${currentDate}`,
    { method: "GET" },
  );

  if (result.success && result.data) {
    const normalized = normalizeSeerrItems(result.data.results);
    res.json({ ...result.data, results: normalized });
  } else {
    res.status(500).json(result);
  }
});

router.get("/popular-tv", async (req, res) => {
  const result = await seerrFetch<{ results: any[]; pageInfo?: any }>(
    req,
    `/api/v1/discover/tv?page=1`,
    { method: "GET" },
  );

  if (result.success && result.data) {
    const normalized = normalizeSeerrItems(result.data.results);
    res.json({ ...result.data, results: normalized });
  } else {
    res.status(500).json(result);
  }
});

router.get("/recent-requests", async (req, res) => {
  const result = await seerrFetch<{ results: any[]; pageInfo?: any }>(
    req,
    "/api/v1/request?filter=all&take=10&sort=modified&skip=0",
    { method: "GET" },
  );

  if (result.success && result.data) {
    const requests = result.data.results;
    const hydratedRequests = await Promise.all(
      requests.map(async (request: any) => {
        if (request.media?.tmdbId && request.type) {
          const detailEndpoint = `/api/v1/${request.type}/${request.media.tmdbId}`;
          const detailResponse = await seerrFetch<any>(req, detailEndpoint);

          if (detailResponse.success && detailResponse.data) {
            return {
              ...request,
              mediaMetadata: {
                ...detailResponse.data,
                mediaType: request.type,
              },
            };
          }
        }
        return request;
      }),
    );
    res.json({ ...result.data, results: hydratedRequests });
  } else {
    res.status(500).json(result);
  }
});

router.get("/discover", async (req, res) => {
  try {
    const results = await Promise.allSettled([
      // Recent
      (async () => {
        const r = await seerrFetch<{ results: any[] }>(
          req,
          "/api/v1/media?filter=allavailable&take=20&sort=mediaAdded",
        );
        if (r.success && r.data) {
          return {
            ...r.data,
            results: await hydrateSeerrItems(req, r.data.results),
          };
        }
        throw new Error(r.message || "Failed to fetch recent");
      })(),
      // Trending
      (async () => {
        const r = await seerrFetch<{ results: any[] }>(
          req,
          "/api/v1/discover/trending?page=1",
        );
        if (r.success && r.data) {
          return { ...r.data, results: normalizeSeerrItems(r.data.results) };
        }
        throw new Error(r.message || "Failed to fetch trending");
      })(),
      // Popular Movies
      (async () => {
        const currentDate = new Date().toISOString().split("T")[0];
        const r = await seerrFetch<{ results: any[] }>(
          req,
          `/api/v1/discover/movies?page=1&primaryReleaseDateGte=${currentDate}`,
        );
        if (r.success && r.data) {
          return { ...r.data, results: normalizeSeerrItems(r.data.results) };
        }
        throw new Error(r.message || "Failed to fetch popular movies");
      })(),
      // Popular TV
      (async () => {
        const r = await seerrFetch<{ results: any[] }>(
          req,
          `/api/v1/discover/tv?page=1`,
        );
        if (r.success && r.data) {
          return { ...r.data, results: normalizeSeerrItems(r.data.results) };
        }
        throw new Error(r.message || "Failed to fetch popular tv");
      })(),
      // Recent Requests
      (async () => {
        const r = await seerrFetch<{ results: any[] }>(
          req,
          "/api/v1/request?filter=all&take=10&sort=modified&skip=0",
        );
        if (r.success && r.data) {
          const hydrated = await Promise.all(
            r.data.results.map(async (reqItem: any) => {
              if (reqItem.media?.tmdbId && reqItem.type) {
                const d = await seerrFetch<any>(
                  req,
                  `/api/v1/${reqItem.type}/${reqItem.media.tmdbId}`,
                );
                if (d.success && d.data) {
                  return {
                    ...reqItem,
                    mediaMetadata: { ...d.data, mediaType: reqItem.type },
                  };
                }
              }
              return reqItem;
            }),
          );
          return { ...r.data, results: hydrated };
        }
        throw new Error(r.message || "Failed to fetch recent requests");
      })(),
    ]);

    const [recent, trending, movies, tv, requests] = results;

    // Log errors for debugging
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Discovery endpoint ${index} failed:`, result.reason);
      }
    });

    res.json({
      recent: recent.status === "fulfilled" ? recent.value : null,
      trending: trending.status === "fulfilled" ? trending.value : null,
      popularMovies: movies.status === "fulfilled" ? movies.value : null,
      popularTv: tv.status === "fulfilled" ? tv.value : null,
      recentRequests: requests.status === "fulfilled" ? requests.value : null,
    });
  } catch (e) {
    console.error("Discovery error", e);
    res.status(500).json({ message: "Internal Server Error during discovery" });
  }
});

router.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]);

  // @ts-ignore
  const r = await seerrFetch<{ results: any[] }>(
    req,
    `/api/v1/search?query=${encodeURIComponent(query as string)}&page=1`,
  );
  if (r.success && r.data) {
    res.json(normalizeSeerrItems(r.data.results));
  } else {
    res.status(500).json([]);
  }
});

router.get("/auth/me", async (req, res) => {
  const r = await seerrFetch(req, "/api/v1/auth/me");
  if (r.success) res.json(r.data);
  else res.status(401).json(r);
});

router.get("/details/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const r = await seerrFetch(req, `/api/v1/${type}/${id}`);
  if (r.success) res.json(r.data);
  else res.status(404).json(r);
});

router.get("/settings/radarr", async (req, res) => {
  const r = await seerrFetch(req, "/api/v1/settings/radarr");
  if (r.success) res.json(r.data);
  else res.status(500).json(r);
});
router.get("/settings/radarr/:id/profiles", async (req, res) => {
  const r = await seerrFetch(
    req,
    `/api/v1/settings/radarr/${req.params.id}/profiles`,
  );
  if (r.success) res.json(r.data);
  else res.status(500).json(r);
});
router.get("/settings/sonarr", async (req, res) => {
  const r = await seerrFetch(req, "/api/v1/settings/sonarr");
  if (r.success) res.json(r.data);
  else res.status(500).json(r);
});
router.get("/settings/sonarr/:id/profiles", async (req, res) => {
  const r = await seerrFetch(
    req,
    `/api/v1/settings/sonarr/${req.params.id}/profiles`,
  );
  if (r.success) res.json(r.data);
  else res.status(500).json(r);
});

router.post("/request", async (req, res) => {
  const r = await seerrFetch(req, "/api/v1/request", {
    method: "POST",
    body: JSON.stringify(req.body),
  });
  if (r.success) res.json(r.data);
  else res.status(500).json(r);
});
router.delete("/request/:id", async (req, res) => {
  const r = await seerrFetch(req, `/api/v1/request/${req.params.id}`, {
    method: "DELETE",
  });
  if (r.success) res.json({ success: true });
  else res.status(500).json(r);
});
router.post("/request/:id/approve", async (req, res) => {
  const r = await seerrFetch(req, `/api/v1/request/${req.params.id}/approve`, {
    method: "POST",
  });
  if (r.success) res.json({ success: true });
  else res.status(500).json(r);
});
router.post("/request/:id/decline", async (req, res) => {
  const r = await seerrFetch(req, `/api/v1/request/${req.params.id}/decline`, {
    method: "POST",
  });
  if (r.success) res.json({ success: true });
  else res.status(500).json(r);
});

// Generic Login/Test Handler
const handleAuthRequest = async (
  req: express.Request,
  res: express.Response,
) => {
  const { authType, username, password } = req.body;

  let endpoint = "";
  let method = "GET";
  let body: any = undefined;

  if (authType === "api-key") {
    endpoint = "/api/v1/auth/me";
  } else if (authType === "local-user") {
    endpoint = "/api/v1/auth/local";
    method = "POST";
    body = { email: username, password };
  } else if (authType === "jellyfin-user") {
    endpoint = "/api/v1/auth/jellyfin";
    method = "POST";
    body = { username, password };
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Unknown auth type" });
  }

  const r = await seerrFetch(req, endpoint, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (r.success) {
    if (r.headers) {
      // Forward Set-Cookie headers to client
      const setCookie = r.headers.getSetCookie
        ? r.headers.getSetCookie()
        : r.headers.get("set-cookie");
      if (setCookie) {
        res.setHeader("Set-Cookie", setCookie);
      }
    }
    res.json({ success: true, message: "Connection Successful" });
  } else {
    res.status(401).json(r);
  }
};

router.post("/test-connection", handleAuthRequest);
router.post("/login", handleAuthRequest);

export default router;
