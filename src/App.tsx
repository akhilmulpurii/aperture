import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLayout from "./components/main-layout";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/settings-context";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { CinematicSplashLoader } from "./components/cinematic-splash-loader";

const minLoadTime = new Promise((resolve) => setTimeout(resolve, 1750));

// Helper to wrap lazy imports with the minimum delay
const lazyWithDelay = (factory: () => Promise<{ default: React.ComponentType<any> }>) =>
  lazy(() => Promise.all([factory(), minLoadTime]).then(([module]) => module));

const Dashboard = lazyWithDelay(() => import("./pages/dashboard"));
const Login = lazyWithDelay(() => import("./pages/login"));
const BoxsetPage = lazyWithDelay(() => import("./pages/boxset/[id]"));
const EpisodePage = lazyWithDelay(() => import("./pages/episode/[id]"));
const LiveTVIndex = lazyWithDelay(() => import("./pages/livetv"));
const LiveTVPage = lazyWithDelay(() => import("./pages/livetv/[id]"));
const LibraryPage = lazyWithDelay(() => import("./pages/library/[id]"));
const MoviePage = lazyWithDelay(() => import("./pages/movie/[id]"));
const PersonPage = lazyWithDelay(() => import("./pages/person/[id]"));
const SearchPage = lazyWithDelay(() => import("./pages/search"));
const SeasonPage = lazyWithDelay(() => import("./pages/season/[id]"));
const SeriesPage = lazyWithDelay(() => import("./pages/series/[id]"));
const SettingsPage = lazyWithDelay(() => import("./pages/settings"));
const PasswordSettingsPage = lazyWithDelay(() => import("./pages/password"));
const QuickConnectPage = lazyWithDelay(() => import("./pages/quick-connect"));
const Main = lazyWithDelay(() => import("./pages/main"));


function App() {
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
        <SettingsProvider>
          <Router>
            <Suspense fallback={<CinematicSplashLoader />}>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Main />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/boxset/:id" element={<BoxsetPage />} />
                  <Route path="/episode/:id" element={<EpisodePage />} />
                  <Route path="/library/:id" element={<LibraryPage />} />
                  <Route path="/livetv" element={<LiveTVIndex />} />
                  <Route path="/livetv/:id" element={<LiveTVPage />} />
                  <Route path="/movie/:id" element={<MoviePage />} />
                  <Route path="/person/:id" element={<PersonPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/season/:id" element={<SeasonPage />} />
                  <Route path="/series/:id" element={<SeriesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/password" element={<PasswordSettingsPage />} />
                  <Route path="/quick-connect" element={<QuickConnectPage />} />
                </Route>
                <Route path="/login" element={<Login />} />
              </Routes>
            </Suspense>
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
