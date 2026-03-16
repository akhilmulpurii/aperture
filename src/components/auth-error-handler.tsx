"use client";
import { useEffect } from "react";
import { executeClearAuthDataAction } from "../actions/store/server-actions";
import { useAuthError } from "../hooks/use-auth-error";
import { useRouter } from "next/navigation";

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
      <div className="flex items-center justify-center min-h-screen z-100 fixed top-0 left-0 right-0 bottom-0 bg-background/90 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Session expired. Redirecting to login...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
