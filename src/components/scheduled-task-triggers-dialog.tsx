"use client";
import { useEffect, useState } from "react";
import type {
  TaskInfo,
  TaskTriggerInfo,
} from "@jellyfin/sdk/lib/generated-client/models";
import { toast } from "sonner";
import { updateTaskTriggers } from "../actions";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import startCase from "lodash/startCase";

type ScheduledTaskTriggersDialogProps = {
  task: TaskInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: TaskInfo) => void;
};

const formatTriggerSummary = (trigger: TaskTriggerInfo) => {
  const formatTicksAsHours = (ticks: number) => {
    const hours = ticks / (3600 * 10_000_000);
    const rounded = Math.round(hours * 100) / 100;
    return `${rounded}h`;
  };
  const formatTicksAsClock = (ticks: number) => {
    const totalSeconds = Math.floor(ticks / 10_000_000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${hours12}:${paddedMinutes} ${period}`;
  };
  const parts: string[] = [];
  if (trigger.IntervalTicks) {
    parts.push(`Every ${formatTicksAsHours(trigger.IntervalTicks)}`);
  }
  if (trigger.DayOfWeek) {
    parts.push(`On ${trigger.DayOfWeek}`);
  }
  if (trigger.TimeOfDayTicks !== null && trigger.TimeOfDayTicks !== undefined) {
    parts.push(`at ${formatTicksAsClock(trigger.TimeOfDayTicks)}`);
  }
  if (trigger.MaxRuntimeTicks) {
    parts.push(`Limit ${formatTicksAsHours(trigger.MaxRuntimeTicks)}`);
  }
  return parts.length ? parts.join(" • ") : "No details";
};

export const ScheduledTaskTriggersDialog = ({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
}: ScheduledTaskTriggersDialogProps) => {
  const [isUpdatingTriggers, setIsUpdatingTriggers] = useState(false);
  const [newTriggerType, setNewTriggerType] = useState("IntervalTrigger");
  const [newIntervalPreset, setNewIntervalPreset] = useState("15");
  const [newTimeOfDay, setNewTimeOfDay] = useState("");
  const [newTimeLimitHours, setNewTimeLimitHours] = useState("");
  const [newDayOfWeek, setNewDayOfWeek] = useState("");
  const [timeOfDayError, setTimeOfDayError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setNewTriggerType("IntervalTrigger");
      setNewIntervalPreset("15");
      setNewTimeOfDay("");
      setNewTimeLimitHours("");
      setNewDayOfWeek("");
      setTimeOfDayError(null);
    }
  }, [open]);

  const applyTriggersUpdate = async (nextTriggers: TaskTriggerInfo[]) => {
    if (!task?.Id) {
      toast.error("Missing task id.");
      return;
    }

    setIsUpdatingTriggers(true);
    try {
      await updateTaskTriggers(task.Id, nextTriggers);
      const updatedTask = { ...task, Triggers: nextTriggers };
      onTaskUpdated(updatedTask);
      toast.success("Task triggers updated.");
    } catch (error) {
      console.error("Failed to update task triggers:", error);
      toast.error("Failed to update task triggers.");
    } finally {
      setIsUpdatingTriggers(false);
    }
  };

  const handleDeleteTrigger = async (index: number) => {
    const triggers = task?.Triggers ?? [];
    const nextTriggers = triggers.filter((_, idx) => idx !== index);
    await applyTriggersUpdate(nextTriggers);
  };

  const handleAddTrigger = async () => {
    const ticksPerSecond = 10_000_000;
    const ticksPerHour = 3600 * ticksPerSecond;
    const isValidTime = (value: string) => /^\d{2}:\d{2}$/.test(value);
    const needsTimeOfDay =
      newTriggerType !== "IntervalTrigger" &&
      newTriggerType !== "StartupTrigger";
    const timeStringToTicks = (value: string) => {
      if (!isValidTime(value)) return null;
      const [hoursRaw, minutesRaw] = value.split(":");
      const hours = Number(hoursRaw);
      const minutes = Number(minutesRaw);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
      return (hours * 3600 + minutes * 60) * ticksPerSecond;
    };

    const nextTrigger: TaskTriggerInfo = {
      Type: newTriggerType,
    };

    if (newTriggerType === "IntervalTrigger") {
      const parsed = Number(newIntervalPreset);
      if (!Number.isNaN(parsed)) {
        nextTrigger.IntervalTicks = Math.max(0, parsed) * 60 * ticksPerSecond;
      }
    }

    if (newTriggerType === "WeeklyTrigger" && newDayOfWeek) {
      nextTrigger.DayOfWeek = newDayOfWeek as TaskTriggerInfo["DayOfWeek"];
    }

    if (needsTimeOfDay) {
      if (newTimeOfDay) {
        const timeTicks = timeStringToTicks(newTimeOfDay);
        if (timeTicks !== null) {
          nextTrigger.TimeOfDayTicks = timeTicks;
        }
      }
    }

    if (needsTimeOfDay) {
      if (!newTimeOfDay) {
        setTimeOfDayError("Time of day is required.");
        return;
      }
      if (!isValidTime(newTimeOfDay)) {
        setTimeOfDayError("Enter a valid time (HH:MM).");
        return;
      }
    }

    if (newTriggerType === "WeeklyTrigger" && !newDayOfWeek) {
      toast.error("Please select a day of week.");
      return;
    }

    if (newTimeLimitHours) {
      const parsed = Number(newTimeLimitHours);
      if (!Number.isNaN(parsed)) {
        nextTrigger.MaxRuntimeTicks = Math.max(0, parsed) * ticksPerHour;
      }
    }

    const triggers = task?.Triggers ?? [];
    await applyTriggersUpdate([...triggers, nextTrigger]);
    setNewIntervalPreset("15");
    setNewTimeOfDay("");
    setNewTimeLimitHours("");
    setNewDayOfWeek("");
    setTimeOfDayError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task?.Name || "Scheduled Task"} Triggers</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Existing triggers
            </p>
            {task?.Triggers?.length ? (
              <div className="space-y-2">
                {task.Triggers.map((trigger, index) => (
                  <div
                    key={`${trigger.Type ?? "trigger"}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {startCase(trigger.Type || "") || "Unknown trigger"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTriggerSummary(trigger)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={isUpdatingTriggers}
                      onClick={() => handleDeleteTrigger(index)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No triggers configured for this task.
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Add new trigger
              </p>
              <p className="text-xs text-muted-foreground">
                Configure when this task should run and how long it can stay
                active.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Trigger type
                </label>
                <Select
                  value={newTriggerType}
                  onValueChange={setNewTriggerType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IntervalTrigger">Interval</SelectItem>
                    <SelectItem value="DailyTrigger">Daily</SelectItem>
                    <SelectItem value="WeeklyTrigger">Weekly</SelectItem>
                    <SelectItem value="StartupTrigger">
                      On app startup
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newTriggerType === "IntervalTrigger" ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Every
                  </label>
                  <Select
                    value={newIntervalPreset}
                    onValueChange={setNewIntervalPreset}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hr</SelectItem>
                      <SelectItem value="120">2 hr</SelectItem>
                      <SelectItem value="240">4 hr</SelectItem>
                      <SelectItem value="360">6 hr</SelectItem>
                      <SelectItem value="720">12 hr</SelectItem>
                      <SelectItem value="1440">24 hr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {newTriggerType === "WeeklyTrigger" ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Day of week
                  </label>
                  <Select value={newDayOfWeek} onValueChange={setNewDayOfWeek}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pick a day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {newTriggerType !== "IntervalTrigger" &&
              newTriggerType !== "StartupTrigger" ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Time of day
                  </label>
                  <Input
                    type="time"
                    value={newTimeOfDay}
                    aria-invalid={Boolean(timeOfDayError)}
                    onChange={(event) => {
                      setNewTimeOfDay(event.target.value);
                      if (timeOfDayError) {
                        setTimeOfDayError(null);
                      }
                    }}
                    onBlur={() => {
                      if (!newTimeOfDay) {
                        setTimeOfDayError("Time of day is required.");
                      } else if (!/^\d{2}:\d{2}$/.test(newTimeOfDay)) {
                        setTimeOfDayError("Enter a valid time (HH:MM).");
                      }
                    }}
                  />
                  {timeOfDayError ? (
                    <p className="text-xs text-destructive">{timeOfDayError}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Time limit (hours)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newTimeLimitHours}
                  onChange={(event) => setNewTimeLimitHours(event.target.value)}
                  placeholder="2"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={isUpdatingTriggers || !task?.Id}
                onClick={handleAddTrigger}
              >
                Add trigger
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
