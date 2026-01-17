import type { TaskInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DottedGlowBackground } from "./dotted-glow-background";
import {
  getTaskIcon,
  getTaskIconProps,
} from "../lib/scheduled-task-icon-mapping";
import { Clock, Play, Square, SquareArrowOutUpRight } from "lucide-react";

type ScheduledTaskCardProps = {
  task: TaskInfo;
  startingTaskId: string | null;
  stoppingTaskId: string | null;
  onStart: (taskId?: string | null) => void;
  onStop: (taskId?: string | null) => void;
  onOpen: (task: TaskInfo) => void;
};

const formatDuration = (start?: string, end?: string) => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "less than a minute";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
};

const formatRelativeTime = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 2) return "just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} months ago`;
  const years = Math.round(days / 365);
  return `${years} years ago`;
};

const buildSubtitle = (task: TaskInfo) => {
  const lastRun = formatRelativeTime(task.LastExecutionResult?.EndTimeUtc);
  const duration = formatDuration(
    task.LastExecutionResult?.StartTimeUtc,
    task.LastExecutionResult?.EndTimeUtc
  );
  if (!lastRun && !duration) return null;
  const parts = [];
  if (lastRun) parts.push(`Last ran ${lastRun}`);
  if (duration) parts.push(`taking ${duration}`);
  return parts.join(", ");
};

export const ScheduledTaskCard = ({
  task,
  startingTaskId,
  stoppingTaskId,
  onStart,
  onStop,
  onOpen,
}: ScheduledTaskCardProps) => {
  const Icon = getTaskIcon(
    task.Name || "",
    task.Category || "",
    task.State || ""
  );
  const iconProps = getTaskIconProps(task.State || "");
  const subtitle = buildSubtitle(task);
  const isRunning = task.State === "Running";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-background/70 p-5 shadow-sm transition ${
        isRunning
          ? "border-primary/40 bg-background/90"
          : "border-border/70 bg-background/70 hover:border-primary/40"
      }`}
    >
      {isRunning ? (
        <DottedGlowBackground
          className="pointer-events-none mask-radial-to-60% mask-radial-at-right"
          opacity={1}
          gap={10}
          radius={1.6}
          colorLightVar="--color-neutral-200"
          glowColorLightVar="--color-neutral-400"
          colorDarkVar="--color-neutral-400"
          glowColorDarkVar="--color-primary"
          backgroundOpacity={0}
          speedMin={0.3}
          speedMax={1}
          speedScale={1}
        />
      ) : null}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/15 text-primary p-2 shadow-sm">
            <Icon {...iconProps} className="text-current" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {task.Name || "Unnamed task"}
              </p>
              {task.State && task.State !== "Idle" ? (
                <Badge variant="default">{task.State}</Badge>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {task.CurrentProgressPercentage !== null &&
              task.CurrentProgressPercentage !== undefined ? (
                <span>{Math.round(task.CurrentProgressPercentage)}%</span>
              ) : null}
            </div>
          </div>
        </div>
        {subtitle ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{subtitle}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {isRunning ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="gap-1.5"
              disabled={stoppingTaskId === task.Id}
              onClick={() => onStop(task.Id)}
            >
              <Square className="h-3.5 w-3.5" />
              {stoppingTaskId === task.Id ? "Stopping..." : "Stop"}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={startingTaskId === task.Id}
              onClick={() => onStart(task.Id)}
            >
              <Play className="h-3.5 w-3.5" />
              {startingTaskId === task.Id ? "Running..." : "Run"}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => onOpen(task)}
          >
            <SquareArrowOutUpRight className="h-3.5 w-3.5" />
            Open
          </Button>
        </div>
      </div>
    </div>
  );
};
