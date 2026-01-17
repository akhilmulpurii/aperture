import { getScheduledTasksApi } from "@jellyfin/sdk/lib/utils/api/scheduled-tasks-api";
import type {
  TaskInfo,
  TaskTriggerInfo,
} from "@jellyfin/sdk/lib/generated-client/models";
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

export async function startScheduledTask(taskId: string): Promise<void> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const scheduledTasksApi = getScheduledTasksApi(api);

  await scheduledTasksApi.startTask({ taskId });
}

export async function stopScheduledTask(taskId: string): Promise<void> {
  const { serverUrl, user } = await getAuthData();
  const jellyfinInstance = createJellyfinInstance();
  const api = jellyfinInstance.createApi(serverUrl);

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  api.accessToken = user.AccessToken;
  const scheduledTasksApi = getScheduledTasksApi(api);

  await scheduledTasksApi.stopTask({ taskId });
}

export async function updateTaskTriggers(
  taskId: string,
  taskTriggerInfo: TaskTriggerInfo[]
): Promise<void> {
  const { serverUrl, user } = await getAuthData();

  if (!user.AccessToken) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${serverUrl}/ScheduledTasks/${taskId}/Triggers`, {
    method: "POST",
    headers: {
      Authorization: `MediaBrowser Token="${user.AccessToken}"`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskTriggerInfo),
  });

  if (!response.ok) {
    throw new Error("Failed to update scheduled task triggers.");
  }
}
