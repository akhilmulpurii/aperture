import { OnboardingFlow } from "@/src/components/onboarding-flow";
import { GET as getConfig } from "@/app/api/config/route";

export default async function LoginPage() {
  const res = await getConfig();
  const data = await res.json();

  return <OnboardingFlow defaultServerUrl={data.defaultServerUrl} />;
}
