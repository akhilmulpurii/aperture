import { VirtualFolderInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { dashboardLoadingAtom } from "../lib/atoms";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { MoreHorizontal } from "lucide-react";
import { renameVirtualFolder } from "../actions/media";
import { Card, CardContent } from "./ui/card";

export default function VirtualFolderCard({
  library,
  icon,
  onScan,
  onRemove,
  onRenameSuccess,
}: {
  library: VirtualFolderInfo;
  icon: React.ReactNode;
  onScan: () => void;
  onRemove: () => void;
  onRenameSuccess: () => void;
}) {
  const navigate = useNavigate();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(library.Name || "");
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);

  const handleRename = async () => {
    if (!library.Name || !newName || newName === library.Name) {
      setIsRenameOpen(false);
      return;
    }

    try {
      setDashboardLoading(true);
      await renameVirtualFolder(library.Name, newName, true);
      toast.success("Library renamed");
      onRenameSuccess();
      setIsRenameOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename library");
    } finally {
      setDashboardLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Library</DialogTitle>
            <DialogDescription>
              Enter a new name for this library.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
        <div className="absolute top-3 right-3 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onScan}>Scan Library</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onRemove}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={() => navigate(`/dashboard/libraries/${library.ItemId}`)}
        />

        <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
          <div
            className={
              "p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 bg-primary/10 text-primary group-hover:bg-primary/20"
            }
          >
            <div className="[&>svg]:h-8 [&>svg]:w-8">{icon}</div>
          </div>

          <div className="space-y-1.5 w-full">
            <h3 className="font-semibold text-lg truncate px-2">
              {library.Name}
            </h3>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
