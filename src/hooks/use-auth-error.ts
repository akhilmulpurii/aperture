import { useAtom } from "jotai";
import { globalAuthErrorAtom } from "../lib/atoms";

export function useAuthError() {
  const [authError, setAuthError] = useAtom(globalAuthErrorAtom);

  const handleAuthError = (error: any) => {
    if (error?.isAuthError) {
      setAuthError(error);
      return true;
    }
    return false;
  };

  return {
    authError,
    setAuthError,
    handleAuthError,
  };
}
