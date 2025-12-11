import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

type ProgressHandler = (progress: number) => void;

interface DiscoveryOptions {
  signal?: AbortSignal;
  onProgress?: ProgressHandler;
  requestTimeoutMs?: number;
}

interface DiscoveryResult {
  url: string;
  responseTime: number;
}

const PRIORITY_HOSTS = ["jellyfin.local", "jellyfin", "localhost", "127.0.0.1"];

const COMMON_BASES = ["192.168.0", "192.168.1", "10.0.0"];
const COMMON_SUFFIXES = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 46, 50, 100, 150, 200];
const FULL_SUFFIXES = Array.from({ length: 254 }, (_, i) => i + 1); // 1..254
const CONCURRENCY = 16;

function isPrivateIPv4(hostname: string | undefined) {
  if (!hostname) return null;
  const match = hostname.match(
    /^(?<a>\d{1,3})\.(?<b>\d{1,3})\.(?<c>\d{1,3})\.(?<d>\d{1,3})$/
  );
  if (!match?.groups) return null;

  const a = Number(match.groups.a);
  const b = Number(match.groups.b);

  const isPrivate =
    a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);

  if (!isPrivate) return null;

  return `${a}.${b}.${match.groups.c}`;
}

function buildHostCandidates(): string[] {
  const hosts = new Set<string>(PRIORITY_HOSTS);

  let preferredBase: string | null = null;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host) {
      hosts.add(host);
      const privateBase = isPrivateIPv4(host);
      if (privateBase) {
        preferredBase = privateBase;
        FULL_SUFFIXES.forEach((suffix) => hosts.add(`${privateBase}.${suffix}`));
      }
    }
  }

  COMMON_BASES.forEach((base) => {
    if (preferredBase === base) return;
    COMMON_SUFFIXES.forEach((suffix) => hosts.add(`${base}.${suffix}`));
  });

  return Array.from(hosts);
}

function buildProbeUrls(host: string): string[] {
  const urls = new Set<string>();
  // Common Jellyfin defaults first
  urls.add(`http://${host}:8096`);
  urls.add(`https://${host}:8920`);
  // Fallback to protocol defaults
  urls.add(`http://${host}`);
  urls.add(`https://${host}`);
  return Array.from(urls);
}

function buildProbeList(): string[] {
  const urls: string[] = [];
  buildHostCandidates().forEach((host) => {
    buildProbeUrls(host).forEach((url) => urls.push(url));
  });
  return urls;
}

async function fetchSystemInfo(
  baseUrl: string,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<DiscoveryResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  const combinedSignal = controller.signal;
  const endpoint = `${baseUrl}/System/Info/Public`;
  const startedAt = performance.now ? performance.now() : Date.now();

  try {
    const response = await (isTauri()
      ? tauriFetch(endpoint, {
          method: "GET",
          connectTimeout: timeoutMs,
          danger: {
            acceptInvalidCerts: true,
            acceptInvalidHostnames: true,
          },
          signal: combinedSignal,
        })
      : fetch(endpoint, { signal: combinedSignal }));

    if (!response.ok) return null;

    const data = await response.json().catch(() => null);
    const productName =
      typeof data?.ProductName === "string"
        ? data.ProductName.toLowerCase()
        : "";

    if (productName.includes("jellyfin")) {
      const responseTime =
        (performance.now ? performance.now() : Date.now()) - startedAt;
      return { url: baseUrl, responseTime };
    }
  } catch {
    // Ignore network errors and timeouts
    return null;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }

  return null;
}

export async function discoverLocalServer(
  options: DiscoveryOptions = {}
): Promise<DiscoveryResult | null> {
  const candidates = buildProbeList();
  if (!candidates.length) return null;

  const { onProgress, signal, requestTimeoutMs = 1200 } = options;
  let tried = 0;
  let found: DiscoveryResult | null = null;
  let index = 0;

  const runWorker = async () => {
    while (!found && index < candidates.length && !signal?.aborted) {
      const current = candidates[index++];
      const result = await fetchSystemInfo(current, requestTimeoutMs, signal);
      tried += 1;
      onProgress?.(Math.min(tried / candidates.length, 1));

      if (result) {
        found = result;
        break;
      }
    }
  };

  const workers = Array.from({ length: CONCURRENCY }, runWorker);
  await Promise.all(workers);

  return found;
}
