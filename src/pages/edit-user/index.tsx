import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { UsersLayoutContextType } from "../manage-users/layout";
import { getUserById, getUserImageUrl } from "../../actions";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbLabel } = useOutletContext<UsersLayoutContextType>();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const userData = await getUserById(id);

        if (userData) {
          setUser(userData);
          setBreadcrumbLabel(userData.Name || `User ${id}`);
        } else {
          setBreadcrumbLabel("User Not Found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load user:", error);
        setBreadcrumbLabel("Error");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, setBreadcrumbLabel]);

  if (loading) {
    return (
      <div className="p-4 text-muted-foreground">Loading user details...</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
    </div>
  );
}
