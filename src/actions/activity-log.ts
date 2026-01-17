import { getActivityLogApi } from "@jellyfin/sdk/lib/utils/api/activity-log-api";
import type { ActivityLogEntryQueryResult } from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";

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
}
