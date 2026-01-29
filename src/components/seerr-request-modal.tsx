import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { Loader2 } from "lucide-react";
import { OptimizedImage } from "./optimized-image";
import { useSeerr } from "../contexts/seerr-context";

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
  const { canManageRequests: isAdmin, addRequest } = useSeerr();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [rootFolders, setRootFolders] = useState<any[]>([]);

  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [selectedRootFolder, setSelectedRootFolder] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Fetch details
      getSeerrMediaDetails(mediaType, tmdbId)
        .then((data) => {
          setDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      // If admin, fetch servers
      if (isAdmin) {
        if (mediaType === "movie") {
          getRadarrSettings().then((data) => {
            if (data && data.length > 0) {
              setServers(data);
              // Default to first server
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
      setRootFolders([]);
    }
  }, [isOpen, tmdbId, mediaType, isAdmin]);

  // Fetch profiles/root folders when server changes
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
      // Default to all seasons for now
      payload.seasons = "all";
    }

    if (isAdmin) {
      if (selectedServerId) payload.serverId = parseInt(selectedServerId);
      if (selectedProfileId) payload.profileId = parseInt(selectedProfileId);
      if (selectedRootFolder) payload.rootFolder = selectedRootFolder;
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
      onClose();
    } else {
      toast.error("Failed to submit request.");
    }
  };

  const posterUrl = details?.posterPath
    ? `https://image.tmdb.org/t/p/w500${details.posterPath}`
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Request {mediaType === "movie" ? "Movie" : "Series"}
          </DialogTitle>
          <DialogDescription>
            Add this title to your request list.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="w-24 flex-shrink-0">
              {posterUrl ? (
                <div className="rounded-md overflow-hidden aspect-[2/3]">
                  <OptimizedImage
                    src={posterUrl}
                    alt={details?.title || details?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-24 bg-muted rounded-md" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold">
                {details?.title || details?.name}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {details?.overview}
              </p>
              <div className="text-xs text-muted-foreground">
                {details?.releaseDate || details?.firstAirDate
                  ? new Date(
                      details?.releaseDate || details?.firstAirDate,
                    ).getFullYear()
                  : ""}
              </div>
            </div>
          </div>
        )}

        {isAdmin && !loading && (
          <div className="space-y-4 py-2 border-t mt-2">
            {/* Server Select - Optional if multi-server */}
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
                      <SelectItem key={server.id} value={server.id.toString()}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Profile Select */}
            <div className="grid gap-2">
              <Label>Quality Profile</Label>
              <Select
                value={selectedProfileId}
                onValueChange={setSelectedProfileId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id.toString()}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-500/10 text-yellow-500 text-xs p-2 rounded border border-yellow-500/20">
              Note: This request will be approved automatically.
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between items-center">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRequest} disabled={submitting || loading}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
