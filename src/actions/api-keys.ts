import { getApiKeyApi } from "@jellyfin/sdk/lib/utils/api/api-key-api";
import type {
  AuthenticationInfo,
  AuthenticationInfoQueryResult,
} from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";

export async function fetchApiKeys(): Promise<AuthenticationInfoQueryResult> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const apiKeyApi = getApiKeyApi(api);

  const { data } = await apiKeyApi.getKeys();
  return {
    Items: data.Items ?? [],
    TotalRecordCount: data.TotalRecordCount ?? 0,
    StartIndex: data.StartIndex ?? 0,
  };
}

export function normalizeApiKeys(items: AuthenticationInfo[]): AuthenticationInfo[] {
  return (items ?? []).map((item) => ({
    ...item,
    AccessToken: item.AccessToken ?? "",
    AppName: item.AppName ?? "Unknown",
    AppVersion: item.AppVersion ?? "",
    DeviceName: item.DeviceName ?? "",
    DeviceId: item.DeviceId ?? "",
    UserId: item.UserId ?? "",
    UserName: item.UserName ?? "",
    DateCreated: item.DateCreated ?? "",
    DateLastActivity: item.DateLastActivity ?? "",
    IsActive: Boolean(item.IsActive),
  }));
}

export async function createApiKey(appName: string): Promise<void> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const apiKeyApi = getApiKeyApi(api);

  await apiKeyApi.createKey({ app: appName });
}

export async function revokeApiKey(key: string): Promise<void> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const apiKeyApi = getApiKeyApi(api);

  await apiKeyApi.revokeKey({ key });
}
