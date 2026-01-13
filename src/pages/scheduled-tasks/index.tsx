import { useEffect, useMemo, useState } from "react";
import { fetchScheduledTasksList } from "../../actions";
import type { TaskInfo } from "@jellyfin/sdk/lib/generated-client/models";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";

export default function ScheduledTasksPage() {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadTasks = async () => {
      try {
        const data = await fetchScheduledTasksList(false);
        if (!isMounted) return;
        setTasks(data);
      } catch (error) {
        console.error("Failed to load scheduled tasks:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    return tasks.slice().sort((a, b) => {
      const aName = a.Name ?? "";
      const bName = b.Name ?? "";
      return aName.localeCompare(bName);
    });
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Scheduled Tasks
            </h3>
            <p className="text-sm text-muted-foreground">
              View all scheduled tasks configured on the server.
            </p>
          </div>
          <Badge variant="secondary">
            {rows.length} tasks
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Loading scheduled tasks...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No scheduled tasks found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((task) => (
                <TableRow key={task.Id || task.Name}>
                  <TableCell className="font-medium">
                    {task.Name}
                  </TableCell>
                  <TableCell>{task.Category || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{task.State || "Unknown"}</Badge>
                  </TableCell>
                  <TableCell>
                    {task.CurrentProgressPercentage ?? 0}%
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
