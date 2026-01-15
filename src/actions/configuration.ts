import { getConfigurationApi } from "@jellyfin/sdk/lib/utils/api/configuration-api";
import { ServerConfiguration } from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";
import { MetadataConfiguration } from "@jellyfin/sdk/lib/generated-client/models";

export async function fetchSystemConfiguration(): Promise<ServerConfiguration> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;

  const configurationApi = getConfigurationApi(api);
  const { data } = await configurationApi.getConfiguration();
  return data;
}

export async function fetchMetadataConfiguration(): Promise<MetadataConfiguration> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;

  // The SDK might not have a direct method for this specific endpoint on the configuration API
  // or it might be named differently. We'll try to find it or fallback to fetch.
  // Checking typical SDK patterns, it might be getMetadataOptions or similar, 
  // but if it's System/Configuration/metadata specifically:
  
  try {
    const url = `${serverUrl}/System/Configuration/metadata`;
    const response = await fetch(url, {
      headers: {
        Authorization: `MediaBrowser Token="${user.AccessToken}"`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata configuration: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch metadata configuration:", error);
    throw error;
  }
}

export async function updateSystemConfiguration(
  configuration: ServerConfiguration
): Promise<void> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const configurationApi = getConfigurationApi(api);

  await configurationApi.updateConfiguration({
    serverConfiguration: configuration,
  });
}

export async function updateMetadataConfiguration(
  metadataConfiguration: MetadataConfiguration
): Promise<void> {
  const { serverUrl, user } = await getAuthData();

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  const url = `${serverUrl}/System/Configuration/metadata`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `MediaBrowser Token="${user.AccessToken}"`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadataConfiguration),
  });

  if (!response.ok) {
    throw new Error(`Failed to update metadata configuration: ${response.statusText}`);
  }
}
