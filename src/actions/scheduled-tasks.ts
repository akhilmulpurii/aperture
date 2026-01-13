import { getScheduledTasksApi } from "@jellyfin/sdk/lib/utils/api/scheduled-tasks-api";
import type { TaskInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { createJellyfinInstance } from "../lib/utils";
import { getAuthData } from "./utils";

export async function fetchScheduledTasksList(
  isHidden = false
): Promise<TaskInfo[]> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const scheduledTasksApi = getScheduledTasksApi(api);

  const { data } = await scheduledTasksApi.getTasks({ isHidden });
  return data ?? [];
}
