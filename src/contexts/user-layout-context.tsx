"use client";

import { createContext, useContext } from "react";

export type UsersLayoutContextType = {
  setBreadcrumbLabel: (label: string) => void;
};

export const UsersLayoutContext = createContext<
  UsersLayoutContextType | undefined
>(undefined);

export function useUsersLayoutContext() {
  const ctx = useContext(UsersLayoutContext);
  if (!ctx)
    throw new Error(
      "useUsersLayoutContext must be used inside UsersLayoutProvider",
    );
  return ctx;
}
