"use client";
import {
  fetchScheduledTasks,
  fetchJellyfinLogs,
  fetchSystemInfo,
  restartServer,
  shutdownServer,
  scanLibrary,
} from "@/src/actions";
import { BentoGrid, BentoItem } from "@/src/components/ui/bento-grid";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  LoaderPinwheel,
  FileText,
  Server,
  Power,
  Database,
  Settings2,
  RefreshCcw,
} from "lucide-react";
import {
  getTaskIcon,
  getTaskIconProps,
} from "@/src/lib/scheduled-task-icon-mapping";
import { DataTable } from "@/src/components/logs/data-table";
import { logColumns } from "@/src/components/logs/columns";
import { useEffect, useState } from "react";
import { LogFile, SystemInfo } from "@jellyfin/sdk/lib/generated-client/models";
import LoadingSpinner from "@/src/components/loading-spinner";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setDashboardLoading(true);
      try {
        const [st, lg, sysInfo] = await Promise.all([
          fetchScheduledTasks(),
          fetchJellyfinLogs(),
          fetchSystemInfo(),
        ]);
        setScheduledTasks(st);
        setLogs(lg);
        setSystemInfo(sysInfo);
      } catch (error: any) {
        console.error(error);
        if (error?.message?.includes("Authentication expired")) {
          // use React Router navigate
          router.push("/login");
        }
      } finally {
        setLoading(false);
        setDashboardLoading(false);
      }
    }

    fetchData();
  }, [setDashboardLoading, router]);

  const handleScanLibrary = async () => {
    setDashboardLoading(true);
    try {
      await scanLibrary();
      toast.success("Library scan started");
    } catch {
      toast.error("Failed to start library scan");
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleRestartServer = async () => {
    if (!confirm("Are you sure you want to restart the server?")) return;
    setDashboardLoading(true);
    try {
      await restartServer();
      toast.success("Server restart initiated");
    } catch {
      toast.error("Failed to restart server");
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleShutdownServer = async () => {
    if (!confirm("Are you sure you want to shutdown the server?")) return;
    setDashboardLoading(true);
    try {
      await shutdownServer();
      toast.success("Server shutdown initiated");
    } catch {
      toast.error("Failed to shutdown server");
    } finally {
      setDashboardLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Filter to show only running tasks
  const runningTasks = scheduledTasks.filter(
    (task) => task.State === "Running",
  );

  // Convert scheduled tasks to BentoGrid items
  const getTaskIconElement = (
    taskName: string,
    category: string,
    state: string,
  ) => {
    const IconComponent = getTaskIcon(taskName, category, state);
    const iconProps = getTaskIconProps(state);
    return <IconComponent {...iconProps} />;
  };

  const getTaskStatus = (state: string) => {
    switch (state) {
      case "Running":
        return "Running";
      case "Completed":
        return "Completed";
      case "Failed":
        return "Failed";
      case "Idle":
        return "Idle";
      default:
        return "Active";
    }
  };

  const bentoItems: BentoItem[] = runningTasks.map((task, index) => ({
    title: task.Name,
    description: task.Description,
    icon: getTaskIconElement(task.Name, task.Category, task.State),
    status: getTaskStatus(task.State),
    tags: [task.Category],
    progress: task.CurrentProgressPercentage || 0,
    colSpan: index === 0 ? 2 : 1, // Make first item span 2 columns
    hasPersistentHover: task.State === "Running", // Highlight running tasks
  }));

  return (
    <div>
      {/* Server Info Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Server Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Server Name</p>
              <p className="font-medium">{systemInfo?.ServerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-medium">{systemInfo?.Version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Architecture</p>
              <p className="font-medium">{systemInfo?.SystemArchitecture}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <Settings2 className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Server Controls</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleScanLibrary}
            >
              <Database className="w-4 h-4" />
              Scan Library
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:text-primary dark:hover:bg-primary/10"
              onClick={handleRestartServer}
            >
              <RefreshCcw className="w-4 h-4" />
              Restart
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:border-red-400/30 dark:text-red-400 dark:hover:bg-red-400/10"
              onClick={handleShutdownServer}
            >
              <Power className="w-4 h-4" />
              Shutdown
            </Button>
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-3 mb-6">
        <h4 className="text-xl font-semibold text-foreground font-poppins">
          Scheduled Tasks
        </h4>
        <Badge variant={"secondary"}>
          <LoaderPinwheel className="animate-spin" />
          {`${runningTasks.length} Running`}
        </Badge>
      </div>
      {runningTasks.length > 0 ? (
        <BentoGrid items={bentoItems} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No running scheduled tasks
        </div>
      )}

      {/* Log Viewer Section */}
      <div className="mt-12">
        <div className="inline-flex items-center gap-3 mb-6">
          <h4 className="text-xl font-semibold text-foreground font-poppins">
            System Logs
          </h4>
          <Badge variant={"secondary"}>
            <FileText className="w-4 h-4" />
            {`${logs.length} Files`}
          </Badge>
        </div>
        <DataTable columns={logColumns} data={logs} />
      </div>
    </div>
  );
}
