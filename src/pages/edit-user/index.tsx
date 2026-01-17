import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { UsersLayoutContextType } from "../manage-users/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { getUserById, getUserImageUrl } from "../../actions";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";
import ProfileTab from "../../components/profile-tabs/profile";
import AccessTab from "../../components/profile-tabs/access";
import ParentalControlTab from "../../components/profile-tabs/parental-control";
import PasswordTab from "../../components/profile-tabs/password";
import { User, Lock, Shield, Settings2 } from "lucide-react";
import { dashboardLoadingAtom } from "../../lib/atoms";
import { useSetAtom } from "jotai";

const TABS = [
  {
    label: "Profile",
    value: "profile",
    icon: User,
    render: (user?: UserDto) => <ProfileTab user={user} />,
  },
  {
    label: "Access",
    value: "access",
    icon: Lock,
    render: (user?: UserDto) => <AccessTab user={user} />,
  },
  {
    label: "Parental Control",
    value: "parental-control",
    icon: Shield,
    render: (user?: UserDto) => <ParentalControlTab user={user} />,
  },
  {
    label: "Password",
    value: "password",
    icon: Settings2,
    render: (user?: UserDto) => <PasswordTab user={user} />,
  },
];

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbLabel } = useOutletContext<UsersLayoutContextType>();
  const [user, setUser] = useState<UserDto | undefined>();
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setDashboardLoading(true);
        const userData = await getUserById(id);

        if (userData) {
          setUser(userData);
          setBreadcrumbLabel(userData.Name || `User ${id}`);
        } else {
          setBreadcrumbLabel("User Not Found");
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setBreadcrumbLabel("Error");
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchUserData();
  }, [id, setBreadcrumbLabel]);

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-muted/40 border border-border/40 backdrop-blur-sm">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="group flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background/60 data-[state=active]:shadow-sm transition-all duration-300 ease-in-out hover:bg-muted/60"
          >
            <tab.icon className="h-4 w-4 group-data-[state=active]:text-primary" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.render(user)}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
