"use client";
import { useEffect } from "react";
import { executeClearAuthDataAction } from "../actions/store/server-actions";
import { useAuthError } from "../hooks/use-auth-error";
import { useRouter } from "next/navigation";
import ErrorWindow from "./error-window";

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const router = useRouter();
  const { authError } = useAuthError();
  console.log("authError", authError);
  useEffect(() => {
    async function handleAuthError() {
      if (authError) {
        console.log("Handling authentication error, clearing auth data...");
        try {
          await executeClearAuthDataAction();
        } catch (clearError) {
          console.error("Failed to clear auth data:", clearError);
        }
        // Redirect to login page
        router.push("/login");
      }
    }

    handleAuthError();
  }, [authError, router]);

  // If it's an auth error, don't render children and show loading state
  if (authError) {
    return (
      <ErrorWindow message="Session expired. Redirecting to login..." spinner />
    );
  }

  return <>{children}</>;
}
