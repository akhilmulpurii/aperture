import { Trash2 } from "lucide-react";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { deleteUser } from "../../actions";
import { toast } from "sonner";
import { dashboardLoadingAtom } from "../../lib/atoms";
import { useAtomValue, useSetAtom } from "jotai";

interface UserCardProps {
  user: UserDto;
  imageUrl?: string;
  onUserDeleted: (userId: string) => void;
}

export function UserCard({ user, imageUrl, onUserDeleted }: UserCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const dashboardLoading = useAtomValue(dashboardLoadingAtom);
  const handleDelete = async () => {
    if (!user.Id) return;
    setDashboardLoading(true);
    try {
      await deleteUser(user.Id);
      toast.success(`User "${user.Name}" deleted successfully`);
      onUserDeleted(user.Id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDashboardLoading(false);
    }
  };

  return (
    <>
      <div className="group flex flex-col items-center justify-center gap-3">
        <Link
          to={`/dashboard/users/${user.Id}`}
          className="flex flex-col items-center justify-center gap-3 transition-transform hover:scale-105 cursor-pointer w-full"
        >
          <div className="relative">
            <Avatar className="h-32 w-32 border-2 border-transparent ring-offset-background transition-all group-hover:border-primary group-hover:ring-2 group-hover:ring-primary/20 group-hover:ring-offset-2">
              <AvatarImage
                src={imageUrl}
                alt={user.Name || "User"}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl font-semibold bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {user.Name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="absolute top-0 right-0 z-10 p-2 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hover:scale-110"
              title="Delete User"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <span className="text-base font-medium text-foreground transition-colors group-hover:text-primary">
            {user.Name}
          </span>
        </Link>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user "{user.Name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={dashboardLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={dashboardLoading}
            >
              {dashboardLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
