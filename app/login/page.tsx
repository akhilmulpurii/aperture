// app/login/page.tsx
import { OnboardingFlow } from "@/src/components/onboarding-flow";

export default async function LoginPage() {
  const res = await fetchConfig();

  return <OnboardingFlow defaultServerUrl={res.defaultServerUrl} />;
}

async function fetchConfig() {
  return { defaultServerUrl: process.env.DEFAULT_SERVER_URL ?? "" };
}
