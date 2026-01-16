import { getConfigurationApi } from "@jellyfin/sdk/lib/utils/api/configuration-api";
import { ServerConfiguration } from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";
import {
  MetadataConfiguration,
  XbmcMetadataOptions,
  EncodingOptions,
} from "@jellyfin/sdk/lib/generated-client/models";

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

  const configurationApi = getConfigurationApi(api);
  // Using getNamedConfiguration with key "metadata"
  // The SDK might return this as File type in definition but it returns JSON in practice
  const { data } = await configurationApi.getNamedConfiguration({
    key: "metadata",
  });

  return data as unknown as MetadataConfiguration;
}

export async function fetchXbmcMetadataConfiguration(): Promise<XbmcMetadataOptions> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;

  const configurationApi = getConfigurationApi(api);
  const { data } = await configurationApi.getNamedConfiguration({
    key: "xbmcmetadata",
  });

  return data as unknown as XbmcMetadataOptions;
}

export async function fetchEncodingConfiguration(): Promise<EncodingOptions> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;

  const configurationApi = getConfigurationApi(api);
  const { data } = await configurationApi.getNamedConfiguration({
    key: "encoding",
  });

  return data as unknown as EncodingOptions;
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
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const configurationApi = getConfigurationApi(api);

  await configurationApi.updateNamedConfiguration({
    key: "metadata",
    body: metadataConfiguration,
  });
}

export async function updateXbmcMetadataConfiguration(
  xbmcMetadataConfiguration: XbmcMetadataOptions
): Promise<void> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const configurationApi = getConfigurationApi(api);

  await configurationApi.updateNamedConfiguration({
    key: "xbmcmetadata",
    body: xbmcMetadataConfiguration,
  });
}

export async function updateEncodingConfiguration(
  encodingOptions: EncodingOptions
): Promise<void> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const configurationApi = getConfigurationApi(api);

  await configurationApi.updateNamedConfiguration({
    key: "encoding",
    body: encodingOptions,
  });
}
