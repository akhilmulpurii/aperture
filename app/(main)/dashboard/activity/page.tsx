"use client";
import { useEffect, useMemo, useState } from "react";
import type { ActivityLogEntry } from "@jellyfin/sdk/lib/generated-client/models";
import { fetchActivityLogEntries } from "@/src/actions";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Search } from "lucide-react";
import { getAuthData } from "@/src/actions/utils";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import { useSetAtom } from "jotai";
import { useAtomValue } from "jotai";

const PAGE_SIZE = 25;

type ActivityFilter = "all" | "user" | "system";
type SortOrder = "desc" | "asc";

export default function DashboardActivityPage() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const dashboardLoading = useAtomValue(dashboardLoadingAtom);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [failedUserImages, setFailedUserImages] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const hasUserId = useMemo(() => {
    if (filter === "all") return undefined;
    return filter === "user";
  }, [filter]);

  const startIndex = useMemo(() => {
    if (sortOrder === "desc") {
      return (page - 1) * PAGE_SIZE;
    }
    if (totalCount > 0) {
      return Math.max(0, totalCount - page * PAGE_SIZE);
    }
    return 0;
  }, [page, sortOrder, totalCount]);

  useEffect(() => {
    let isMounted = true;
    const loadServerUrl = async () => {
      try {
        const auth = await getAuthData();
        if (isMounted) {
          setServerUrl(auth.serverUrl);
        }
      } catch (error) {
        console.error("Failed to load server url:", error);
      }
    };

    loadServerUrl();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadEntries = async () => {
      try {
        setDashboardLoading(true);
        const result = await fetchActivityLogEntries({
          startIndex,
          limit: PAGE_SIZE,
          hasUserId,
        });
        if (!isMounted) return;
        let items = result.Items ?? [];
        if (debouncedSearchQuery) {
          const lower = debouncedSearchQuery.toLowerCase();
          items = items.filter((entry) => {
            const name = entry.Name?.toLowerCase() ?? "";
            const overview = entry.Overview?.toLowerCase() ?? "";
            const shortOverview = entry.ShortOverview?.toLowerCase() ?? "";
            const type = entry.Type?.toLowerCase() ?? "";
            const severity = entry.Severity?.toLowerCase() ?? "";
            return (
              name.includes(lower) ||
              overview.includes(lower) ||
              shortOverview.includes(lower) ||
              type.includes(lower) ||
              severity.includes(lower)
            );
          });
        }
        setEntries(items);
        setTotalCount(result.TotalRecordCount ?? 0);
      } catch (error) {
        console.error("Failed to load activity entries:", error);
      } finally {
        if (isMounted) {
          setDashboardLoading(false);
        }
      }
    };

    loadEntries();
    return () => {
      isMounted = false;
    };
  }, [startIndex, hasUserId, debouncedSearchQuery, setDashboardLoading]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [filter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const displayEntries =
    sortOrder === "asc" ? entries.slice().reverse() : entries;

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString();
  };

  const getSeverityClassName = (severity?: string) => {
    switch ((severity || "").toLowerCase()) {
      case "critical":
      case "error":
        return "!bg-rose-500/15 !text-rose-700";
      case "warning":
        return "!bg-amber-500/20 !text-amber-700";
      case "info":
      case "information":
        return "!bg-sky-500/15 !text-sky-700";
      case "debug":
      case "trace":
        return "!bg-slate-500/15 !text-slate-600";
      default:
        return "!bg-muted/60 !text-muted-foreground";
    }
  };

  const getUserImageUrl = (entry: ActivityLogEntry) => {
    if (!entry.UserId || !serverUrl) return null;
    const params = new URLSearchParams({
      maxWidth: "40",
      maxHeight: "40",
      quality: "80",
    });
    if (entry.UserPrimaryImageTag) {
      params.set("tag", entry.UserPrimaryImageTag);
    }
    return `${serverUrl}/Users/${
      entry.UserId
    }/Images/Primary?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search activity"
                className="pl-9"
              />
            </div>
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as ActivityFilter)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as SortOrder)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || dashboardLoading}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || dashboardLoading}
            >
              Next
            </Button>
          </div>
        </div>

        {dashboardLoading ? (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
            Loading activity entries...
          </div>
        ) : displayEntries.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
            No activity entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Time</TableHead>
                  <TableHead className="w-30">Level</TableHead>
                  <TableHead className="w-18">User</TableHead>
                  <TableHead className="w-55">Name</TableHead>
                  <TableHead>Overview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayEntries.map((entry, index) => {
                  const userImageUrl = getUserImageUrl(entry);
                  const imageFailed = entry.UserId
                    ? failedUserImages[entry.UserId]
                    : false;
                  return (
                    <TableRow key={`${entry.Id ?? "entry"}-${index}`}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(entry.Date)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-2 py-0.5 text-[0.65rem] ${getSeverityClassName(
                            entry.Severity,
                          )}`}
                        >
                          {entry.Severity || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted/80 text-[0.65rem] font-semibold text-muted-foreground">
                            {userImageUrl && !imageFailed ? (
                              <img
                                src={userImageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={() => {
                                  if (!entry.UserId) return;
                                  setFailedUserImages((prev) => ({
                                    ...prev,
                                    [entry.UserId!]: true,
                                  }));
                                }}
                              />
                            ) : entry.UserId ? (
                              <span>S</span>
                            ) : (
                              <span className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-slate-700 to-slate-500 text-[0.6rem] font-semibold text-white">
                                SYS
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {entry.Name || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.ShortOverview || entry.Overview || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
