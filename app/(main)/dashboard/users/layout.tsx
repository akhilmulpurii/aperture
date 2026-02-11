"use client";
import { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UsersLayoutContext } from "@/src/contexts/user-layout-context";

export type UsersLayoutContextType = {
  setBreadcrumbLabel: (label: string) => void;
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [breadcrumbLabel, setBreadcrumbLabel] = useState<string>("");

  const isIndexPage =
    pathname === "/dashboard/users" || pathname === "/dashboard/users/";

  // Reset breadcrumb label on route change
  useEffect(() => {
    setBreadcrumbLabel("");
  }, [pathname]);

  // Helper to generate breadcrumb items based on current path
  const getBreadcrumbs = () => {
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");
    // Expecting path like: dashboard, users, [add | :id]

    // Base breadcrumb: Dashboard > Users
    const items = [
      <BreadcrumbItem key="users">
        <BreadcrumbLink asChild>
          <Link href="/dashboard/users">Users</Link>
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
          </BreadcrumbItem>,
        );
      } else {
        items.push(
          <BreadcrumbItem key="edit">
            <BreadcrumbPage>{breadcrumbLabel || "Edit User"}</BreadcrumbPage>
          </BreadcrumbItem>,
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
      <UsersLayoutContext.Provider value={{ setBreadcrumbLabel }}>
        {children}
      </UsersLayoutContext.Provider>
    </div>
  );
}
