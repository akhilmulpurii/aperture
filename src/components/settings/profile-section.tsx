"use client";
import { ChevronDown, ImagePlus, QrCode, Settings2, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { getUser, getUserImageUrl, uploadUserImage } from "../../actions";
import { toast } from "sonner";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { JellyfinUserWithToken } from "../../types/jellyfin";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

export default function ProfileSection() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [user, setUser] = useState<JellyfinUserWithToken | null>(null);
  const router = useRouter();

  const updateAvatarPreview = useCallback((next: string | null) => {
    setAvatarPreview((previous) => {
      if (previous && previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const currentUser = await getUser();
        if (!isMounted) return;
        setUser(currentUser);

        if (currentUser?.Id) {
          try {
            const url = await getUserImageUrl(currentUser.Id);
            if (!isMounted) return;
            setAvatarUrl(url);
          } catch (error) {
            console.error("Failed to load avatar", error);
          }
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAvatarDialogToggle = useCallback(
    (open: boolean) => {
      setAvatarDialogOpen(open);
      if (!open) {
        setPendingAvatarFile(null);
        updateAvatarPreview(null);
      }
    },
    [updateAvatarPreview],
  );

  const handleAvatarFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create image element to load the file
      const img = new Image();
      img.src = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create canvas for 1:1 center crop
      const canvas = document.createElement("canvas");
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      // Calculate crop position
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      // Draw cropped image
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

      // Convert back to blob/file
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Failed to create blob");
            return;
          }
          const croppedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          setPendingAvatarFile(croppedFile);
          const objectUrl = URL.createObjectURL(croppedFile);
          updateAvatarPreview(objectUrl);

          // Clean up original object URL
          URL.revokeObjectURL(img.src);
        },
        file.type,
        0.9,
      );
    } catch (error) {
      console.error("Failed to crop image:", error);
      // Fallback to original file if cropping fails
      setPendingAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      updateAvatarPreview(objectUrl);
    }
  };

  const handleAvatarSave = async () => {
    if (!user?.Id || !pendingAvatarFile) return;

    try {
      // Upload the new avatar
      await uploadUserImage(user.Id, pendingAvatarFile);

      // Show success message
      toast.success("Profile picture updated successfully", {
        duration: 2000,
      });

      // Dispatch custom event to update avatar everywhere
      window.dispatchEvent(new Event("user-avatar-updated"));

      // Update local state without refresh
      if (avatarPreview) {
        setAvatarUrl(avatarPreview);
      }

      // Close dialog
      handleAvatarDialogToggle(false);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error("Failed to update profile picture");
    }
  };

  const lastSeen = useMemo(() => {
    const lastSeenRaw = user?.LastLoginDate ?? user?.LastActivityDate;
    return lastSeenRaw
      ? new Date(lastSeenRaw).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;
  }, [user]);

  const displayAvatar = avatarPreview ?? avatarUrl ?? undefined;

  const membershipLabel = profileLoading
    ? "Loading profile..."
    : lastSeen
      ? `Last active ${lastSeen}`
      : "Profile details will appear here soon.";
  const profileTiles = [
    {
      title: "Password",
      description: "Change the credentials you use to access Apertúre.",
      icon: Lock,
      cta: "Update password",
      action: () => router.push("/password"),
    },
    {
      title: "Quick Connect",
      description: "Pair a new device with a one-time Jellyfin code.",
      icon: QrCode,
      cta: "Enter code",
      action: () => router.push("/quick-connect"),
    },
    {
      title: "Profile Picture",
      description: "Refresh the avatar we show across every screen.",
      icon: ImagePlus,
      cta: "View & edit",
      action: () => handleAvatarDialogToggle(true),
    },
  ];

  return (
    <Fragment>
      <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
        <Card className="bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="flex items-center gap-2 font-poppins text-lg">
              <Settings2 className="h-5 w-5" />
              Profile & Security
            </CardTitle>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={profileOpen}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                {profileOpen ? "Hide" : "Show"}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    profileOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CardDescription className="w-full">
              Manage how you sign in, link devices, and refresh your avatar.
            </CardDescription>
          </CardHeader>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-up data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-down">
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-border/60">
                    {displayAvatar ? (
                      <AvatarImage
                        src={displayAvatar}
                        alt="Profile avatar"
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-lg font-semibold">
                      {(user?.Name?.[0] ?? "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-semibold">
                      {user?.Name ?? "Your profile"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {membershipLabel}
                    </p>
                    {user?.Policy?.IsAdministrator ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        Administrator
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {profileTiles.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <div
                      key={tile.title}
                      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{tile.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {tile.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-auto"
                        onClick={tile.action}
                      >
                        {tile.cta}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      <Dialog open={avatarDialogOpen} onOpenChange={handleAvatarDialogToggle}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Profile picture</DialogTitle>
            <DialogDescription>
              Preview your current image and stage a replacement. We&apos;ll
              save it once the profile APIs are connected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative size-32 overflow-hidden rounded-full border-4 border-border/60">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Avatar preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-secondary text-3xl font-semibold">
                    {(user?.Name?.[0] ?? "U").toUpperCase()}
                  </div>
                )}
              </div>
              {pendingAvatarFile ? (
                <p className="text-xs text-muted-foreground">
                  Selected file: {pendingAvatarFile.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-upload">Upload new image</Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your changes are only previewed for now. Save to apply.
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleAvatarDialogToggle(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                disabled={!pendingAvatarFile}
                onClick={handleAvatarSave}
              >
                Save changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
