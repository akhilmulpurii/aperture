import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import BoxsetPage from "./pages/boxset/[id]";
import EpisodePage from "./pages/episode/[id]";
import LiveTVIndex from "./pages/livetv";
import LiveTVPage from "./pages/livetv/[id]";
import LibraryPage from "./pages/library/[id]";
import MoviePage from "./pages/movie/[id]";
import PersonPage from "./pages/person/[id]";
import SearchPage from "./pages/search";
import SeasonPage from "./pages/season/[id]";
import SeriesPage from "./pages/series/[id]";
import SettingsPage from "./pages/settings";
import PasswordSettingsPage from "./pages/password";
import QuickConnectPage from "./pages/quick-connect";
import Main from "./pages/main";
// import Main Layout

import MainLayout from "./components/main-layout";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/settings-context";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

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
      ]}
    >
      <Toaster />
      <AuthProvider>
        <SettingsProvider>
          <Router>
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
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
