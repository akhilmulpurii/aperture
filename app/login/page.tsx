import { OnboardingFlow } from "@/src/components/onboarding-flow";

export default async function LoginPage() {
  const res = await fetch("http://localhost:3000/api/config");
  const data = await res.json();
  return <OnboardingFlow defaultServerUrl={data.defaultServerUrl} />;
}
