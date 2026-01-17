import { useState, type FormEvent } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuroraBackground } from "../../components/aurora-background";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { changeUserPassword } from "../../actions";
import { useAtomValue, useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "../../lib/atoms";

const MIN_PASSWORD_LENGTH = 3;

export default function PasswordSettingsPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const dashboardLoading = useAtomValue(dashboardLoadingAtom);
  const meetsLengthRequirement = newPassword.length >= MIN_PASSWORD_LENGTH;

  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const canSubmit =
    currentPassword.length > 0 &&
    meetsLengthRequirement &&
    passwordsMatch &&
    !dashboardLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!meetsLengthRequirement) {
      setFormError(
        `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("New password and confirmation must match.");
      return;
    }

    setDashboardLoading(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      toast.success("Password updated successfully.");

      setSuccessMessage(
        "All set! We'll use your new password the next time you sign in."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const message =
        error?.message ||
        "We couldn't update your password. Please verify your current password and try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setDashboardLoading(false);
    }
  };

  return (
    <div className="relative max-w-full overflow-hidden px-4 py-6">
      <AuroraBackground />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Lock className="h-5 w-5" />
          <span className="text-sm uppercase tracking-wide">
            Account Security
          </span>
        </div>

        <div>
          <h2 className="font-poppins text-3xl font-semibold text-foreground">
            Password settings
          </h2>
          <p className="text-muted-foreground">
            Update your Jellyfin password securely. We&apos;ll refresh your
            credentials everywhere once the change succeeds.
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Update password</CardTitle>
            <CardDescription>
              Enter your current credentials, pick a stronger password, and
              we&apos;ll update Jellyfin immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      aria-invalid={
                        !meetsLengthRequirement && newPassword !== ""
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum {MIN_PASSWORD_LENGTH} characters.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-type your new password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      aria-invalid={
                        confirmPassword.length > 0 && !passwordsMatch
                      }
                      required
                    />
                    {confirmPassword.length > 0 && !passwordsMatch ? (
                      <p className="text-xs text-destructive">
                        Passwords must match exactly.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  Pick anything memorable—as long as it is at least{" "}
                  <span className="font-semibold text-foreground">
                    {MIN_PASSWORD_LENGTH} characters
                  </span>
                  . We'll keep the rest of the logic simple.
                </div>
              </div>

              {formError ? (
                <div
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {formError}
                </div>
              ) : null}

              {successMessage ? (
                <div
                  className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400"
                  role="status"
                >
                  {successMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/settings")}
                >
                  Back to settings
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {dashboardLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    "Save password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
