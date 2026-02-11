"use client";
import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  QrCode,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AuroraBackground } from "@/src/components/aurora-background";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  authorizeQuickConnectCode,
  isQuickConnectEnabled,
} from "@/src/actions";
import { useRouter } from "next/navigation";

const MIN_CODE_LENGTH = 4;
const MAX_CODE_LENGTH = 8;

export default function QuickConnectPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [availability, setAvailability] = useState<
    "checking" | "available" | "disabled"
  >("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const enabled = await isQuickConnectEnabled(true);
        if (!mounted) return;
        setAvailability(enabled ? "available" : "disabled");
      } catch (error) {
        console.error("Failed to check Quick Connect availability:", error);
        if (mounted) {
          setAvailability("disabled");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const formattedCode = useMemo(() => {
    const normalized = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const groups = normalized.match(/.{1,3}/g);
    return groups ? groups.join(" ") : normalized;
  }, [code]);

  const canSubmit =
    formattedCode.replace(/\s/g, "").length >= MIN_CODE_LENGTH &&
    availability === "available" &&
    !isSubmitting;

  const handleCodeChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setCode(sanitized.slice(0, MAX_CODE_LENGTH));
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (availability !== "available") {
      setErrorMessage(
        "Quick Connect is disabled on this server. Ask your admin to enable it.",
      );
      return;
    }

    const normalized = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (normalized.length < MIN_CODE_LENGTH) {
      setErrorMessage("Enter the full code before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authorizeQuickConnectCode(normalized);
      toast.success("Device authorized");
      setStatusMessage(
        "Nice! The requesting device should now be signed in automatically.",
      );
      setCode("");
    } catch (error: any) {
      const message =
        error?.message ||
        "We couldn't authorize that code. Double-check it and try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative max-w-full overflow-hidden px-4 py-6">
      <AuroraBackground />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm uppercase tracking-wide">
            Device Approvals
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="font-poppins text-3xl font-semibold text-foreground">
            Quick Connect
          </h2>
          <p className="text-muted-foreground">
            Enter the code shown on the new device. Once approved, Jellyfin will
            complete the sign-in automatically.
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Authorize a new device</CardTitle>
            <CardDescription>
              Quick Connect lets you pair without typing your password on every
              screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="quick-connect-code">Quick Connect code</Label>
                <Input
                  id="quick-connect-code"
                  type="text"
                  inputMode="text"
                  autoComplete="one-time-code"
                  placeholder="ABC-123"
                  value={formattedCode}
                  onChange={(event) => handleCodeChange(event.target.value)}
                  disabled={availability !== "available"}
                  className="tracking-[0.30em] uppercase"
                  aria-invalid={Boolean(errorMessage)}
                />
                <p className="text-xs text-muted-foreground">
                  {availability === "checking" && "Checking server support…"}
                  {availability === "disabled" &&
                    "Quick Connect is turned off on this server."}
                  {availability === "available" &&
                    `Use 4–${MAX_CODE_LENGTH} characters (letters or numbers).`}
                </p>
              </div>

              {errorMessage ? (
                <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              {statusMessage ? (
                <div className="flex gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/settings")}
                >
                  Back to settings
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authorizing…
                    </>
                  ) : (
                    "Authorize device"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4" />
              How Quick Connect works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                On the new device, choose Quick Connect to display a short code.
              </li>
              <li>
                Enter that code here while signed in. You can be on web, mobile,
                or TV.
              </li>
              <li>
                Jellyfin matches the code and signs in the new device without
                needing your password.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
