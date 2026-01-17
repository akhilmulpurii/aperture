import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";

export type UsersLayoutContextType = {
  setBreadcrumbLabel: (label: string) => void;
};

export default function UsersLayout() {
  const location = useLocation();
  const [breadcrumbLabel, setBreadcrumbLabel] = useState<string>("");

  const isIndexPage =
    location.pathname === "/dashboard/users" ||
    location.pathname === "/dashboard/users/";

  // Reset breadcrumb label on route change
  useEffect(() => {
    setBreadcrumbLabel("");
  }, [location.pathname]);

  // Helper to generate breadcrumb items based on current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname
      .split("/")
      .filter((segment) => segment !== "");
    // Expecting path like: dashboard, users, [add | :id]

    // Base breadcrumb: Dashboard > Users
    const items = [
      <BreadcrumbItem key="users">
        <BreadcrumbLink asChild>
          <Link to="/dashboard/users">Users</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>,
    ];

    if (!isIndexPage) {
      items.push(<BreadcrumbSeparator key="sep-1" />);

      const lastSegment = pathSegments[pathSegments.length - 1];

      if (lastSegment === "add") {
        items.push(
          <BreadcrumbItem key="add">
            <BreadcrumbPage>Add User</BreadcrumbPage>
          </BreadcrumbItem>
        );
      } else {
        items.push(
          <BreadcrumbItem key="edit">
            <BreadcrumbPage>{breadcrumbLabel || "Edit User"}</BreadcrumbPage>
          </BreadcrumbItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {!isIndexPage && (
        <Breadcrumb>
          <BreadcrumbList>{getBreadcrumbs()}</BreadcrumbList>
        </Breadcrumb>
      )}
      <Outlet
        context={{ setBreadcrumbLabel } satisfies UsersLayoutContextType}
      />
    </div>
  );
}
