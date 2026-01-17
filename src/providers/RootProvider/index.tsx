import { AuthProvider } from "../../contexts/AuthContext";
import { SettingsProvider } from "../../contexts/settings-context";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={[
        "light",
        "dark",
        "cinematic-theatre-black",
        "neon-grid",
        "emerald-ember",
        "sunset-blocks",
        "crimson-obelisk",
        "peach-sorbet",
        "lilac-dream",
        "deep-velvet",
        "glassmorphism",
      ]}
    >
      <Toaster />
      <AuthProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
