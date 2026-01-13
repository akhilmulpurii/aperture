import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CinematicSplashLoader } from "../components/cinematic-splash-loader";
import MainLayout from "../components/main-layout";
import DashboardLayout from "../components/dashboard-layout";

// Lazy loaded Routes
// Auth Routes
const Login = lazy(() => import("../pages/login"));
// Dashboard Routes
const Dashboard = lazy(() => import("../pages/dashboard"));
const DashboardGeneralPage = lazy(() => import("../pages/dashboard-general"));
const DashboardActivityPage = lazy(() => import("../pages/dashboard-activity"));
const ScheduledTasksPage = lazy(() => import("../pages/scheduled-tasks"));
const DashboardKeysPage = lazy(() => import("../pages/dashboard-keys"));
const ManageUsersPage = lazy(() => import("../pages/manage-users"));
// Main App Routes
const Main = lazy(() => import("../pages/main"));
const BoxsetPage = lazy(() => import("../pages/boxset/[id]"));
const EpisodePage = lazy(() => import("../pages/episode/[id]"));
const LiveTVIndex = lazy(() => import("../pages/livetv"));
const LiveTVPage = lazy(() => import("../pages/livetv/[id]"));
const LibraryPage = lazy(() => import("../pages/library/[id]"));
const MoviePage = lazy(() => import("../pages/movie/[id]"));
const PersonPage = lazy(() => import("../pages/person/[id]"));
const SearchPage = lazy(() => import("../pages/search"));
const SeasonPage = lazy(() => import("../pages/season/[id]"));
const SeriesPage = lazy(() => import("../pages/series/[id]"));
// Settings Routes
const SettingsPage = lazy(() => import("../pages/settings"));
const PasswordSettingsPage = lazy(() => import("../pages/password"));
const QuickConnectPage = lazy(() => import("../pages/quick-connect"));

export default function AppRouter() {
  return (
    <Router>
      <Suspense fallback={<CinematicSplashLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Main />} />
            <Route path="dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="general" element={<DashboardGeneralPage />} />
              <Route path="users" element={<ManageUsersPage />} />
              <Route path="activity" element={<DashboardActivityPage />} />
              <Route path="tasks" element={<ScheduledTasksPage />} />
              <Route path="keys" element={<DashboardKeysPage />} />
            </Route>
            <Route path="boxset/:id" element={<BoxsetPage />} />
            <Route path="episode/:id" element={<EpisodePage />} />
            <Route path="library/:id" element={<LibraryPage />} />
            <Route path="livetv" element={<LiveTVIndex />} />
            <Route path="livetv/:id" element={<LiveTVPage />} />
            <Route path="movie/:id" element={<MoviePage />} />
            <Route path="person/:id" element={<PersonPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="season/:id" element={<SeasonPage />} />
            <Route path="series/:id" element={<SeriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="password" element={<PasswordSettingsPage />} />
            <Route path="quick-connect" element={<QuickConnectPage />} />
          </Route>
          <Route path="login" element={<Login />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
