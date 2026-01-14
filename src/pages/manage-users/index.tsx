import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { fetchUsers, getUserImageUrl } from "../../actions";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";
import { Link } from "react-router-dom";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [userImages, setUserImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUsers = async () => {
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
        })
      );
      setUserImages(images);
    };

    loadUsers();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <Link
          to="/dashboard/users/add"
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
          <Link
            to={`/dashboard/users/${user.Id}`}
            key={user.Id}
            className="group flex flex-col items-center justify-center gap-3 transition-transform hover:scale-105 cursor-pointer"
          >
            <Avatar className="h-32 w-32 border-2 border-transparent ring-offset-background transition-all group-hover:border-primary group-hover:ring-2 group-hover:ring-primary/20 group-hover:ring-offset-2">
              <AvatarImage
                src={user.Id ? userImages[user.Id] : undefined}
                alt={user.Name || "User"}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl font-semibold bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {user.Name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-base font-medium text-foreground transition-colors group-hover:text-primary">
              {user.Name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
