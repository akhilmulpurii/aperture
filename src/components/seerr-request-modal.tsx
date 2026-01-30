import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  getSeerrMediaDetails,
  getRadarrSettings,
  getRadarrProfiles,
  getSonarrSettings,
  getSonarrProfiles,
  submitSeerrRequest,
  deleteSeerrRequest,
} from "../actions/seerr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Trash2,
  X,
} from "lucide-react";
import { OptimizedImage } from "./optimized-image";
import { useSeerr } from "../contexts/seerr-context";
import { Badge } from "./ui/badge";

interface SeerrRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  mediaType: "movie" | "tv";
}

export function SeerrRequestModal({
  isOpen,
  onClose,
  tmdbId,
  mediaType,
}: SeerrRequestModalProps) {
  const { canManageRequests: isAdmin, addRequest, removeRequest } = useSeerr();

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getSeerrMediaDetails(mediaType, tmdbId)
        .then((data) => {
          setDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      if (isAdmin) {
        if (mediaType === "movie") {
          getRadarrSettings().then((data) => {
            if (data && data.length > 0) {
              setServers(data);
              const firstServer = data[0];
              setSelectedServerId(firstServer.id.toString());
            }
          });
        } else {
          getSonarrSettings().then((data) => {
            if (data && data.length > 0) {
              setServers(data);
              const firstServer = data[0];
              setSelectedServerId(firstServer.id.toString());
            }
          });
        }
      }
    } else {
      setDetails(null);
      setServers([]);
      setProfiles([]);
    }
  }, [isOpen, tmdbId, mediaType, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedServerId) return;

    const serverId = parseInt(selectedServerId);
    if (isNaN(serverId)) return;

    if (mediaType === "movie") {
      getRadarrProfiles(serverId).then((data) => {
        if (data) setProfiles(data);
      });
    } else {
      getSonarrProfiles(serverId).then((data) => {
        if (data) setProfiles(data);
      });
    }
  }, [selectedServerId, mediaType, isAdmin]);

  const handleRequest = async () => {
    setSubmitting(true);

    const payload: any = {
      mediaType,
      mediaId: tmdbId,
    };

    if (mediaType === "tv") {
      payload.seasons = "all";
    }

    if (isAdmin) {
      if (selectedServerId) payload.serverId = parseInt(selectedServerId);
      if (selectedProfileId) payload.profileId = parseInt(selectedProfileId);
    }

    const requestData = await submitSeerrRequest(payload);
    setSubmitting(false);

    if (requestData) {
      toast.success("Request submitted successfully!");

      const hydratedRequest = {
        ...requestData,
        mediaMetadata: {
          ...details,
          mediaType,
        },
      };

      addRequest(hydratedRequest);

      setDetails((prev: any) => ({
        ...prev,
        mediaInfo: {
          ...prev.mediaInfo,
          status: requestData.status,
          requests: [requestData],
        },
      }));
    } else {
      toast.error("Failed to submit request.");
    }
  };

  const handleDeleteRequestById = async (requestId: number) => {
    if (!requestId) return;

    if (!confirm("Are you sure you want to cancel this request?")) return;

    setSubmitting(true);
    const success = await deleteSeerrRequest(requestId);
    setSubmitting(false);

    if (success) {
      toast.success("Request cancelled successfully.");
      removeRequest(requestId);
      // Refresh details to update list
      getSeerrMediaDetails(mediaType, tmdbId).then(setDetails);
    } else {
      toast.error("Failed to cancel request.");
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    if (!requestId) return;

    setSubmitting(true);
    const { approveSeerrRequest } = await import("../actions/seerr");
    const success = await approveSeerrRequest(requestId);
    setSubmitting(false);

    if (success) {
      toast.success("Request approved.");
      getSeerrMediaDetails(mediaType, tmdbId).then(setDetails);
    } else {
      toast.error("Failed to approve request.");
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    if (!requestId) return;

    setSubmitting(true);
    const { declineSeerrRequest } = await import("../actions/seerr");
    const success = await declineSeerrRequest(requestId);
    setSubmitting(false);

    if (success) {
      toast.success("Request declined.");
      getSeerrMediaDetails(mediaType, tmdbId).then(setDetails);
    } else {
      toast.error("Failed to decline request.");
    }
  };

  const posterUrl = details?.posterPath
    ? `https://image.tmdb.org/t/p/w500${details.posterPath}`
    : undefined;

  const backdropUrl = details?.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${details.backdropPath}`
    : undefined;

  // Media Status Logic
  const mediaInfo = details?.mediaInfo;
  const requests = mediaInfo?.requests || [];
  const mediaStatus = mediaInfo?.status;

  const isAvailable = mediaStatus === 5;
  const isPartiallyAvailable = mediaStatus === 4;
  const isPending = mediaStatus === 2 || mediaStatus === 3;
  const isDeclined = mediaStatus === 1;

  const userExistingRequest = requests.find(
    (r: any) =>
      r.requestedBy?.id === details?.userInfo?.id &&
      (r.status === 1 || r.status === 2 || r.status === 3),
  );

  const showRequestButton =
    !isAvailable && !isPartiallyAvailable && !isPending && !userExistingRequest;

  const {
    mediaStatusTitle,
    mediaStatusMessage,
    mediaStatusIcon,
    mediaStatusColor,
  } = getMediaStatusDetails(mediaStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl overflow-hidden p-0 gap-0">
        <div className="relative w-full h-48 md:h-64 bg-muted">
          {backdropUrl ? (
            <OptimizedImage
              src={backdropUrl}
              alt="Backdrop"
              className="w-full h-full object-cover opacity-60"
            />
          ) : posterUrl ? (
            <div className="w-full h-full bg-black/40 relative overflow-hidden">
              <OptimizedImage
                src={posterUrl}
                alt="Backdrop Blur"
                className="w-full h-full object-cover blur-3xl opacity-50 scale-110"
              />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            {posterUrl && (
              <div className="w-24 md:w-32 aspect-[2/3] rounded-lg shadow-2xl overflow-hidden border-2 border-background/20 hidden sm:block">
                <OptimizedImage
                  src={posterUrl}
                  alt="Poster"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="mb-1">
              <DialogTitle className="text-2xl md:text-3xl font-bold shadow-black drop-shadow-md">
                {details?.title || details?.name}
              </DialogTitle>
              <div className="text-sm md:text-base text-muted-foreground flex items-center gap-2 mt-1">
                {details?.releaseDate || details?.firstAirDate
                  ? new Date(
                      details?.releaseDate || details?.firstAirDate,
                    ).getFullYear()
                  : "Unknown Year"}

                {details?.runtime > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {Math.floor(details.runtime / 60)}h {details.runtime % 60}
                      m
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              <DialogDescription className="text-base leading-relaxed">
                {details?.overview}
              </DialogDescription>

              <div className="flex flex-wrap gap-2">
                {details?.genres?.map((g: any) => (
                  <Badge
                    key={g.id}
                    variant="secondary"
                    className="px-2 py-0.5 text-xs"
                  >
                    {g.name}
                  </Badge>
                ))}
              </div>

              {/* Media Status Alert */}
              {mediaStatusTitle && (
                <div
                  className={`rounded-lg p-4 border flex items-start gap-3 ${mediaStatusColor}`}
                >
                  {mediaStatusIcon}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{mediaStatusTitle}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mediaStatusMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Requests List */}
              {requests.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Requests
                  </h3>
                  <div className="space-y-2">
                    {requests.map((req: any) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {req.requestedBy?.email
                              ?.substring(0, 2)
                              .toUpperCase() || "??"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {req.requestedBy?.email || "Unknown User"}
                              </span>
                              <RequestStatusBadge status={req.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAdmin && req.status === 1 && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-green-500 hover:text-green-600 border-green-500/20 hover:bg-green-500/10"
                                onClick={() => handleApproveRequest(req.id)}
                                disabled={submitting}
                                title="Approve Request"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-red-500 hover:text-red-600 border-red-500/20 hover:bg-red-500/10"
                                onClick={() => handleDeclineRequest(req.id)}
                                disabled={submitting}
                                title="Decline Request"
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}

                          {(isAdmin ||
                            (req.requestedBy?.id === details?.userInfo?.id &&
                              req.status === 1)) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteRequestById(req.id)}
                              disabled={submitting}
                              title="Delete Request"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showRequestButton && isAdmin && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">Admin Options</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servers.length > 1 && (
                      <div className="grid gap-2">
                        <Label>Server</Label>
                        <Select
                          value={selectedServerId}
                          onValueChange={setSelectedServerId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Server" />
                          </SelectTrigger>
                          <SelectContent>
                            {servers.map((server) => (
                              <SelectItem
                                key={server.id}
                                value={server.id.toString()}
                              >
                                {server.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label>Quality Profile</Label>
                      <Select
                        value={selectedProfileId}
                        onValueChange={setSelectedProfileId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Profile" />
                        </SelectTrigger>
                        <SelectContent z-index={200}>
                          {profiles.map((profile) => (
                            <SelectItem
                              key={profile.id}
                              value={profile.id.toString()}
                            >
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="bg-muted/30 p-4 sm:justify-between items-center border-t">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {showRequestButton && !loading && (
            <Button onClick={handleRequest} disabled={submitting || loading}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request {mediaType === "movie" ? "Movie" : "Series"}
            </Button>
          )}
          {isAvailable && (
            <Button variant="outline" disabled className="gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Available
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestStatusBadge({ status }: { status: number }) {
  switch (status) {
    case 1:
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 h-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        >
          Pending
        </Badge>
      );
    case 2:
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 h-4 bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Approved
        </Badge>
      );
    case 3:
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 h-4 bg-red-500/10 text-red-500 border-red-500/20"
        >
          Declined
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 h-4">
          Unknown
        </Badge>
      );
  }
}

function getMediaStatusDetails(mediaStatus: number) {
  if (mediaStatus === 5) {
    return {
      mediaStatusTitle: "Available",
      mediaStatusMessage: "This title is available on your media server.",
      mediaStatusIcon: (
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
      ),
      mediaStatusColor: "bg-green-500/10 border-green-500/20",
    };
  }
  if (mediaStatus === 4) {
    return {
      mediaStatusTitle: "Partially Available",
      mediaStatusMessage: "Some parts of this title are available.",
      mediaStatusIcon: (
        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
      ),
      mediaStatusColor: "bg-blue-500/10 border-blue-500/20",
    };
  }
  if (mediaStatus === 3 || mediaStatus === 2) {
    return {
      mediaStatusTitle: "Pending Details",
      mediaStatusMessage: "Content is downloading or in queue.",
      mediaStatusIcon: <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />,
      mediaStatusColor: "bg-yellow-500/10 border-yellow-500/20",
    };
  }
  if (mediaStatus === 1) {
    return {
      mediaStatusTitle: "Declined",
      mediaStatusMessage: "This media request was declined.",
      mediaStatusIcon: <X className="h-5 w-5 text-red-500 mt-0.5" />,
      mediaStatusColor: "bg-red-500/10 border-red-500/20",
    };
  }

  return {
    mediaStatusTitle: "",
    mediaStatusMessage: "",
    mediaStatusIcon: null,
    mediaStatusColor: "",
  };
}
