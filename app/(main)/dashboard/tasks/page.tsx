"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchScheduledTasksList,
  startScheduledTask,
  stopScheduledTask,
} from "@/src/actions";
import type { TaskInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import { ScheduledTaskCard } from "@/src/components/scheduled-task-card";
import { ScheduledTaskTriggersDialog } from "@/src/components/scheduled-task-triggers-dialog";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import { useSetAtom } from "jotai";
import { useAtomValue } from "jotai";

export default function ScheduledTasksPage() {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [startingTaskId, setStartingTaskId] = useState<string | null>(null);
  const [stoppingTaskId, setStoppingTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskInfo | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const dashboardLoading = useAtomValue(dashboardLoadingAtom);

  useEffect(() => {
    isMountedRef.current = true;

    const loadTasks = async () => {
      setDashboardLoading(true);
      try {
        const data = await fetchScheduledTasksList(false);
        if (!isMountedRef.current) return;
        setTasks(data);
      } catch (error) {
        console.error("Failed to load scheduled tasks:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    const clearPolling = () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    const scheduleNextPoll = () => {
      clearPolling();
      pollTimeoutRef.current = setTimeout(async () => {
        if (!isMountedRef.current) return;
        await loadTasks();
        if (document.visibilityState === "visible") {
          scheduleNextPoll();
        }
      }, 60000);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadTasks().finally(() => {
          scheduleNextPoll();
        });
      } else {
        clearPolling();
      }
    };

    loadTasks().finally(() => {
      scheduleNextPoll();
    });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMountedRef.current = false;
      clearPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [setDashboardLoading]);

  const sections = useMemo(() => {
    const grouped = new Map<string, TaskInfo[]>();
    tasks.forEach((task) => {
      const category = task.Category || "Other";
      const current = grouped.get(category) ?? [];
      current.push(task);
      grouped.set(category, current);
    });
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, items]) => ({
        category,
        items: items.slice().sort((a, b) => {
          const aName = a.Name ?? "";
          const bName = b.Name ?? "";
          return aName.localeCompare(bName);
        }),
      }));
  }, [tasks]);

  const handleStartTask = async (taskId?: string | null) => {
    if (!taskId || startingTaskId) return;
    try {
      setStartingTaskId(taskId);
      await startScheduledTask(taskId);
      toast.success("Task started.");
      const data = await fetchScheduledTasksList(false);
      setTasks(data);
    } catch (error) {
      console.error("Failed to start task:", error);
      toast.error("Failed to start task.");
    } finally {
      setStartingTaskId(null);
    }
  };

  const handleOpenTask = (task: TaskInfo) => {
    setSelectedTask(task);
  };

  const handleStopTask = async (taskId?: string | null) => {
    if (!taskId || stoppingTaskId) return;
    try {
      setStoppingTaskId(taskId);
      await stopScheduledTask(taskId);
      toast.success("Task stopped.");
      const data = await fetchScheduledTasksList(false);
      setTasks(data);
    } catch (error) {
      console.error("Failed to stop task:", error);
      toast.error("Failed to stop task.");
    } finally {
      setStoppingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {dashboardLoading ? (
          <div className="rounded-2xl border border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
            Loading scheduled tasks...
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
            No scheduled tasks found.
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.category} className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {section.category}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {section.items.length}
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((task) => {
                  return (
                    <ScheduledTaskCard
                      key={task.Id || task.Name}
                      task={task}
                      startingTaskId={startingTaskId}
                      stoppingTaskId={stoppingTaskId}
                      onStart={handleStartTask}
                      onStop={handleStopTask}
                      onOpen={handleOpenTask}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      <ScheduledTaskTriggersDialog
        task={selectedTask}
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
          }
        }}
        onTaskUpdated={(updatedTask) => {
          setTasks((prev) =>
            prev.map((task) =>
              task.Id === updatedTask.Id ? updatedTask : task,
            ),
          );
          setSelectedTask(updatedTask);
        }}
      />
    </div>
  );
}
