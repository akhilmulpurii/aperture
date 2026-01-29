import { AuthErrorHandler } from "../../components/auth-error-handler";
import { AuroraBackground } from "../../components/aurora-background";
import { SearchBar } from "../../components/search-component";
import { useEffect, useState } from "react";
import { getAuthData } from "../../actions";
import { useNavigate } from "react-router-dom";

export default function DiscoverPage() {
  const [authError, setAuthError] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        await getAuthData();
      } catch (error: any) {
        console.error("Failed to load data:", error);

        if (error.isAuthError) {
          setAuthError(error);
          navigate("/login", { replace: true });
        }
      }
    }

    fetchData();
  }, [navigate]);

  return (
    <AuthErrorHandler error={authError}>
      <div className="relative px-4 py-6 max-w-full overflow-hidden">
        <AuroraBackground />

        <div className="relative z-[99] mb-8">
          <div className="mb-6">
            <SearchBar />
          </div>
        </div>
      </div>
    </AuthErrorHandler>
  );
}
