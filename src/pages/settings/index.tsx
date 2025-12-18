import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AuroraBackground } from "../../components/aurora-background";
import { SearchBar } from "../../components/search-component";
import { Badge } from "../../components/ui/badge";
import {
  Settings2,
  Palette,
  Check,
  ChevronDown,
  Lock,
  QrCode,
  ImagePlus,
  Camera,
  LayoutDashboard,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { THEME_VARIANTS } from "../../data/theme-presets";
import { cn } from "../../lib/utils";
import { themeSelectionAtom } from "../../lib/atoms";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { getUser, getUserImageUrl, uploadUserImage } from "../../actions";
import type { JellyfinUserWithToken } from "../../types/jellyfin";
import { Link } from "react-router-dom";

import { useSettings } from "../../contexts/settings-context";
import { toast } from "sonner";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const {
    enableThemeBackdrops,
    setEnableThemeBackdrops,
    enableThemeSongs,
    setEnableThemeSongs,
  } = useSettings();
  const [selectedTheme, setSelectedTheme] = useAtom(themeSelectionAtom);
  const [profileOpen, setProfileOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const [user, setUser] = useState<JellyfinUserWithToken | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
    [updateAvatarPreview]
  );

  const handleAvatarFileChange = async (
    event: ChangeEvent<HTMLInputElement>
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
        0.9
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

  // Mock preferences
  const preferences = [
    {
      id: "enable-theme-backdrops",
      title: "Enable Theme Backdrops",
      description: "Show dynamic background images from media.",
      checked: enableThemeBackdrops,
      onCheckedChange: setEnableThemeBackdrops,
    },
    {
      id: "enable-theme-songs",
      title: "Enable Theme Songs",
      description: "Play theme music when viewing media details.",
      checked: enableThemeSongs,
      onCheckedChange: setEnableThemeSongs,
    },
  ];

  const displayAvatar = avatarPreview ?? avatarUrl ?? undefined;
  const lastSeenRaw = user?.LastLoginDate ?? user?.LastActivityDate;
  const lastSeen = lastSeenRaw
    ? new Date(lastSeenRaw).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
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
      action: () => navigate("/password"),
    },
    {
      title: "Quick Connect",
      description: "Pair a new device with a one-time Jellyfin code.",
      icon: QrCode,
      cta: "Enter code",
      action: () => navigate("/quick-connect"),
    },
    {
      title: "Profile Picture",
      description: "Refresh the avatar we show across every screen.",
      icon: ImagePlus,
      cta: "View & edit",
      action: () => handleAvatarDialogToggle(true),
    },
  ];

  const ThemePreview = ({ themeId }: { themeId: string }) => {
    const Panel = () => (
      <div className="flex h-10 gap-1" aria-hidden="true">
        <div
          className="flex-1 rounded-md border"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
          }}
        />
        <div
          className="flex-1 rounded-md border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        />
        <div
          className="w-3 rounded-md border"
          style={{
            background: "var(--primary)",
            borderColor: "var(--primary)",
          }}
        />
      </div>
    );

    if (themeId === "system") {
      return (
        <div className="flex gap-1">
          <div className="flex-1 rounded-lg border p-1 light">
            <Panel />
          </div>
          <div className="flex-1 rounded-lg border p-1 dark">
            <Panel />
          </div>
        </div>
      );
    }

    const previewClass =
      themeId === "light" || themeId === "dark" ? themeId : themeId || "";

    return (
      <div className={cn("rounded-lg border p-1", previewClass)}>
        <Panel />
      </div>
    );
  };

  useEffect(() => {
    if (!theme) return;

    const variantFromTheme = THEME_VARIANTS.variants.find(
      (variant) => variant.themeId === theme
    );

    if (
      variantFromTheme &&
      (selectedTheme.variant !== variantFromTheme.name ||
        selectedTheme.family !== THEME_VARIANTS.name)
    ) {
      setSelectedTheme({
        family: THEME_VARIANTS.name,
        variant: variantFromTheme.name,
      });
    }
  }, [theme, selectedTheme.family, selectedTheme.variant, setSelectedTheme]);

  const handleVariantSelect = useCallback(
    (variantName: string, themeId: string) => {
      if (
        selectedTheme.family === THEME_VARIANTS.name &&
        selectedTheme.variant === variantName
      ) {
        return;
      }

      setSelectedTheme({
        family: THEME_VARIANTS.name,
        variant: variantName,
      });
      setTheme(themeId);
    },
    [selectedTheme.family, selectedTheme.variant, setSelectedTheme, setTheme]
  );

  return (
    <div className="relative px-4 py-6 max-w-full overflow-hidden">
      <AuroraBackground />
      <div className="relative z-10">
        <div className="mb-6">
          <SearchBar />
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2 font-poppins flex items-center gap-2">
            <Settings2 className="h-8 w-8" />
            Settings
          </h2>
          <p className="text-muted-foreground">
            Customize the interface and preview upcoming dashboard themes.
          </p>
        </div>

        <div className="grid gap-6">
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
                        profileOpen ? "rotate-180" : "rotate-0"
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
                              <p className="text-sm font-semibold">
                                {tile.title}
                              </p>
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

          {user?.Policy?.IsAdministrator ? (
            <Card className="bg-card/80 backdrop-blur ">
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </CardTitle>
                <Link
                  to={"/dashboard"}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  Open Dashboard
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      themesOpen ? "rotate-180" : "rotate-0"
                    )}
                  />
                </Link>
                <CardDescription className="w-full">
                  Manage your Jellyfin server and system settings.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <Collapsible open={preferencesOpen} onOpenChange={setPreferencesOpen}>
            <Card className="bg-card/80 backdrop-blur">
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                  <Sliders className="h-5 w-5" />
                  User Preferences
                </CardTitle>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    aria-expanded={preferencesOpen}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                  >
                    {preferencesOpen ? "Hide" : "Show"}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        preferencesOpen ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CardDescription className="w-full">
                  Customize your playback and interface experience.
                </CardDescription>
              </CardHeader>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-up data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-down">
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {preferences.map((pref) => (
                      <div
                        key={pref.id}
                        className="flex items-start space-x-4 rounded-2xl border border-border/60 bg-background/70 p-4"
                      >
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {pref.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pref.description}
                          </p>
                        </div>
                        <Switch
                          checked={pref.checked}
                          onCheckedChange={pref.onCheckedChange}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={themesOpen} onOpenChange={setThemesOpen}>
            <Card className="bg-card/80 backdrop-blur">
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                  <Palette className="h-5 w-5" />
                  Themes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[11px]">
                    {THEME_VARIANTS.variants.length} variant
                    {THEME_VARIANTS.variants.length !== 1 ? "s" : ""}
                  </Badge>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      aria-expanded={themesOpen}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                    >
                      {themesOpen ? "Hide" : "Show"}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          themesOpen ? "rotate-180" : "rotate-0"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CardDescription className="w-full">
                  Explore the palette families that power the dashboard theming
                  system and apply any variant instantly.
                </CardDescription>
              </CardHeader>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-up data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-down">
                <CardContent className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {THEME_VARIANTS.variants.map((variant) => {
                      const isSelected =
                        selectedTheme?.variant === variant.name;

                      return (
                        <button
                          key={`${THEME_VARIANTS.name}-${variant.name}`}
                          type="button"
                          onClick={() =>
                            handleVariantSelect(variant.name, variant.themeId)
                          }
                          className={cn(
                            "group flex flex-col gap-1.5 rounded-2xl border bg-background/70 p-2.5 text-left transition focus-visible:outline focus-visible:outline-primary/40",
                            isSelected
                              ? "border-primary/60 bg-primary/5 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                              : "border-border/60 hover:-translate-y-0.5 hover:border-primary/40"
                          )}
                        >
                          <div className="relative">
                            <ThemePreview themeId={variant.themeId} />
                            {isSelected ? (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-primary shadow">
                                <Check className="h-3 w-3" />
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-sm font-medium text-foreground">
                            <span className="truncate">{variant.name}</span>
                            <span
                              className={cn(
                                "text-[11px] font-normal",
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            >
                              {isSelected ? "Active" : "Preview"}
                            </span>
                          </div>
                          {variant.description ? (
                            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                              {variant.description}
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

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
      </div>
    </div>
  );
}
