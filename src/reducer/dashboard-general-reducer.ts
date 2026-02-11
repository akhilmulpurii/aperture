import type { ServerConfiguration } from "@jellyfin/sdk/lib/generated-client/models";

export type GeneralFormState = {
  configuration: ServerConfiguration | null;
  serverName: string;
  cachePath: string;
  metadataPath: string;
  selectedLanguage: string;
  quickConnectEnabled: boolean;
  parallelLibraryScan: string;
  parallelImageEncoding: string;
};

export type GeneralFormAction =
  | { type: "init"; configuration: ServerConfiguration | null }
  | { type: "set"; field: keyof GeneralFormState; value: string | boolean };

export const initialGeneralFormState: GeneralFormState = {
  configuration: null,
  serverName: "",
  cachePath: "",
  metadataPath: "",
  selectedLanguage: "",
  quickConnectEnabled: false,
  parallelLibraryScan: "",
  parallelImageEncoding: "",
};

export function dashboardGeneralReducer(
  state: GeneralFormState,
  action: GeneralFormAction,
): GeneralFormState {
  switch (action.type) {
    case "init": {
      const config = action.configuration;
      return {
        configuration: config,
        serverName: config?.ServerName ?? "",
        cachePath: config?.CachePath ?? "",
        metadataPath: config?.MetadataPath ?? "",
        selectedLanguage: config?.UICulture ?? "",
        quickConnectEnabled: Boolean(config?.QuickConnectAvailable),
        parallelLibraryScan:
          config?.LibraryScanFanoutConcurrency?.toString() ?? "",
        parallelImageEncoding:
          config?.ParallelImageEncodingLimit?.toString() ?? "",
      };
    }
    case "set":
      return { ...state, [action.field]: action.value } as GeneralFormState;
    default:
      return state;
  }
}
