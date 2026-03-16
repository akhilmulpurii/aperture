import { getConfigurationApi } from "@jellyfin/sdk/lib/utils/api/configuration-api";
import { ServerConfiguration } from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";
import {
  MetadataConfiguration,
  XbmcMetadataOptions,
  EncodingOptions,
} from "@jellyfin/sdk/lib/generated-client/models";
import { isAuthError } from "./media";

export async function fetchSystemConfiguration(): Promise<ServerConfiguration> {
  try {
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
  } catch (error) {
    console.log("Error fetching system configuration", error);
    if (isAuthError(error)) {
      const authError = new Error(
        "Authentication expired. Please sign in again.",
      );
      (authError as any).isAuthError = true;
      throw authError;
    }

    return {};
  }
}

export async function fetchMetadataConfiguration(): Promise<MetadataConfiguration> {
  try {
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
  } catch (error) {
    console.log("Error fetching metadata configuration", error);
    if (isAuthError(error)) {
      const authError = new Error(
        "Authentication expired. Please sign in again.",
      );
      (authError as any).isAuthError = true;
      throw authError;
    }
    return {};
  }
}

export async function fetchXbmcMetadataConfiguration(): Promise<XbmcMetadataOptions> {
  try {
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
  } catch (error) {
    console.log("Error fetching xbmc metadata configuration", error);
    if (isAuthError(error)) {
      const authError = new Error(
        "Authentication expired. Please sign in again.",
      );
      (authError as any).isAuthError = true;
      throw authError;
    }
    return {};
  }
}

export async function fetchEncodingConfiguration(): Promise<EncodingOptions> {
  try {
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
  } catch (error) {
    console.log("Error fetching encoding configuration", error);
    if (isAuthError(error)) {
      const authError = new Error(
        "Authentication expired. Please sign in again.",
      );
      (authError as any).isAuthError = true;
      throw authError;
    }
    return {};
  }
}

export async function updateSystemConfiguration(
  configuration: ServerConfiguration,
): Promise<void> {
  try {
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
  } catch (error) {
    console.log("Error updating system configuration", error);
    if (isAuthError(error)) {
      const authError = new Error(
        "Authentication expired. Please sign in again.",
      );
      (authError as any).isAuthError = true;
      throw authError;
    }
    throw error;
  }
}

export async function updateMetadataConfiguration(
  metadataConfiguration: MetadataConfiguration,
): Promise<void> {
  try {
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
  } catch (error) {
    console.log("Error updating metadata configuration", error);
    if (isAuthError(error)) {
      const authError = new Error(
        "Authentication expired. Please sign in again.",
      );
      (authError as any).isAuthError = true;
      throw authError;
    }
    throw error;
  }
}

export async function updateXbmcMetadataConfiguration(
  xbmcMetadataConfiguration: XbmcMetadataOptions,
): Promise<void> {
  try {
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
  } catch (error) {
    console.log("Error updating xbmc metadata configuration", error);
    if (isAuthError(error)) {
      const authError = new Error(
        "Authentication expired. Please sign in again.",
      );
      (authError as any).isAuthError = true;
      throw authError;
    }
    throw error;
  }
}

export async function updateEncodingConfiguration(
  encodingOptions: EncodingOptions,
): Promise<void> {
  try {
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
  } catch (error) {
    console.log("Error updating encoding configuration", error);
    if (isAuthError(error)) {
      const authError = new Error(
        "Authentication expired. Please sign in again.",
      );
      (authError as any).isAuthError = true;
      throw authError;
    }
    throw error;
  }
}
