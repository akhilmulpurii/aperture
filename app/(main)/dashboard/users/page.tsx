"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { fetchUsers, getUserImageUrl } from "@/src/actions";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";
import { UserCard } from "@/src/components/user-card";
import { dashboardLoadingAtom } from "@/src/lib/atoms";
import { useSetAtom } from "jotai";
import Link from "next/link";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [userImages, setUserImages] = useState<Record<string, string>>({});
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);

  useEffect(() => {
    const loadUsers = async () => {
      setDashboardLoading(true);
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);

        const images: Record<string, string> = {};
        await Promise.all(
          fetchedUsers.map(async (user) => {
            if (user.Id) {
              try {
                images[user.Id] = await getUserImageUrl(user.Id);
              } catch (e) {
                console.error(`Failed to get image for user ${user.Id}`, e);
              }
            }
          }),
        );
        setUserImages(images);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadUsers();
  }, [setDashboardLoading]);

  const handleUserDeleted = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((u) => u.Id !== userId));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <Link
          href="/dashboard/users/add"
          className="group cursor-pointer flex flex-col items-center justify-center gap-3 transition-transform hover:scale-105 focus:outline-none"
        >
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/20 transition-colors group-hover:border-primary group-hover:bg-primary/10">
            <Plus className="h-12 w-12 text-muted-foreground/50 transition-colors group-hover:text-primary" />
          </div>
          <span className="text-base font-medium text-muted-foreground transition-colors group-hover:text-primary">
            Add New User
          </span>
        </Link>

        {users.map((user) => (
          <UserCard
            key={user.Id}
            user={user}
            imageUrl={user.Id ? userImages[user.Id] : undefined}
            onUserDeleted={handleUserDeleted}
          />
        ))}
      </div>
    </div>
  );
}
