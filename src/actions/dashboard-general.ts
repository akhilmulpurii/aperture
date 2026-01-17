import { getConfigurationApi } from "@jellyfin/sdk/lib/utils/api/configuration-api";
import { getLocalizationApi } from "@jellyfin/sdk/lib/utils/api/localization-api";
import type {
  LocalizationOption,
  ServerConfiguration,
} from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";

export interface DashboardGeneralData {
  configuration: ServerConfiguration | null;
  localizationOptions: LocalizationOption[];
  quickConnectEnabled: boolean;
}

export async function fetchDashboardGeneralData(): Promise<DashboardGeneralData> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;

  const configurationApi = getConfigurationApi(api);
  const localizationApi = getLocalizationApi(api);

  const [configuration, localizationOptions] = await Promise.all([
    configurationApi.getConfiguration().then((response) => response.data).catch(() => {
      console.error("Failed to fetch system configuration for dashboard general.");
      return null;
    }),
    localizationApi
      .getLocalizationOptions()
      .then((response) => response.data ?? [])
      .catch(() => {
        console.error("Failed to fetch localization options.");
        return [];
      }),
  ]);

  return {
    configuration,
    localizationOptions,
    quickConnectEnabled: Boolean(configuration?.QuickConnectAvailable),
  };
}

export async function updateDashboardConfiguration(
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
