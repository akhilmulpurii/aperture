import { getActivityLogApi } from "@jellyfin/sdk/lib/utils/api/activity-log-api";
import type { ActivityLogEntryQueryResult } from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";
import { isAuthError } from "./media";

type FetchActivityLogParams = {
  startIndex?: number;
  limit?: number;
  hasUserId?: boolean;
};

export async function fetchActivityLogEntries({
  startIndex,
  limit,
  hasUserId,
}: FetchActivityLogParams): Promise<ActivityLogEntryQueryResult> {
  try {
    const { serverUrl, user } = await getAuthData();
    const jellyfinInstance = createJellyfinInstance();
    const api = jellyfinInstance.createApi(serverUrl);

    if (!user.AccessToken) {
      throw new Error("No access token found");
    }

    api.accessToken = user.AccessToken;
    const activityLogApi = getActivityLogApi(api);

    const { data } = await activityLogApi.getLogEntries({
      startIndex,
      limit,
      hasUserId,
    });

    return data ?? {};
  } catch (error) {
    console.error("Failed to fetch activity log entries:", error);

    // If it's an authentication error, throw an error with a special flag
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
