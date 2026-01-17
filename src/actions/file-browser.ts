import { getEnvironmentApi } from "@jellyfin/sdk/lib/utils/api/environment-api";
import type {
  DefaultDirectoryBrowserInfoDto,
  FileSystemEntryInfo,
} from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";

async function getEnvironmentClient() {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  return getEnvironmentApi(api);
}

export async function fetchDefaultDirectoryBrowser(): Promise<DefaultDirectoryBrowserInfoDto | null> {
  try {
    const environmentApi = await getEnvironmentClient();
    const { data } = await environmentApi.getDefaultDirectoryBrowser();
    return data ?? null;
  } catch (error) {
    console.error("Failed to fetch default directory browser:", error);
    return null;
  }
}

export async function fetchDrives(): Promise<FileSystemEntryInfo[]> {
  try {
    const environmentApi = await getEnvironmentClient();
    const { data } = await environmentApi.getDrives();
    return data ?? [];
  } catch (error) {
    console.error("Failed to fetch drives:", error);
    return [];
  }
}

export async function fetchDirectoryContents(
  path: string,
  includeFiles = false,
  includeDirectories = true
): Promise<FileSystemEntryInfo[]> {
  try {
    const environmentApi = await getEnvironmentClient();
    const { data } = await environmentApi.getDirectoryContents({
      path,
      includeFiles,
      includeDirectories,
    });
    return data ?? [];
  } catch (error) {
    console.error("Failed to fetch directory contents:", error);
    return [];
  }
}

export async function fetchParentPath(path: string): Promise<string | null> {
  try {
    const environmentApi = await getEnvironmentClient();
    const { data } = await environmentApi.getParentPath({ path });
    return data ?? null;
  } catch (error) {
    console.error("Failed to fetch parent path:", error);
    return null;
  }
}
