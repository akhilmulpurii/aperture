import { OnboardingFlow } from "@/src/components/onboarding-flow";

export default async function LoginPage() {
  const defaultServerUrl = process.env.DEFAULT_SERVER_URL ?? "";
  return <OnboardingFlow defaultServerUrl={defaultServerUrl} />;
}
