import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
const UsersLayout = lazy(() => import("../pages/manage-users/layout"));
const AddUserPage = lazy(() => import("../pages/add-user"));
const EditUserPage = lazy(() => import("../pages/edit-user"));
const LibrariesPage = lazy(() => import("../pages/dashboard-libraries"));
const EditLibraryPage = lazy(() => import("../pages/dashboard-libraries/[id]"));
const AddLibraryPage = lazy(() => import("../pages/dashboard-libraries/add"));
const LibrariesDisplayPage = lazy(
  () => import("../pages/dashboard-libraries/display"),
);
const LibrariesMetadataPage = lazy(
  () => import("../pages/dashboard-libraries/metadata"),
);
const LibrariesNfoSettingsPage = lazy(
  () => import("../pages/dashboard-libraries/nfo-settings"),
);
const PlaybackTranscodingPage = lazy(
  () => import("../pages/dashboard-playback/transcoding"),
);
const PlaybackResumePage = lazy(
  () => import("../pages/dashboard-playback/resume"),
);
const PlaybackStreamingPage = lazy(
  () => import("../pages/dashboard-playback/streaming"),
);
const PlaybackTrickplayPage = lazy(
  () => import("../pages/dashboard-playback/trickplay"),
);
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
const DiscoverPage = lazy(() => import("../pages/discover"));
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
              <Route path="users" element={<UsersLayout />}>
                <Route index element={<ManageUsersPage />} />
                <Route path="add" element={<AddUserPage />} />
                <Route path=":id" element={<EditUserPage />} />
              </Route>
              <Route path="libraries">
                <Route index element={<LibrariesPage />} />
                <Route path=":id" element={<EditLibraryPage />} />
                <Route path="add" element={<AddLibraryPage />} />
                <Route path="display" element={<LibrariesDisplayPage />} />
                <Route path="metadata" element={<LibrariesMetadataPage />} />
                <Route
                  path="nfo-settings"
                  element={<LibrariesNfoSettingsPage />}
                />
              </Route>
              <Route path="playback">
                <Route index element={<Navigate to="transcoding" replace />} />
                <Route
                  path="transcoding"
                  element={<PlaybackTranscodingPage />}
                />
                <Route path="resume" element={<PlaybackResumePage />} />
                <Route path="streaming" element={<PlaybackStreamingPage />} />
                <Route path="trickplay" element={<PlaybackTrickplayPage />} />
              </Route>
              <Route path="activity" element={<DashboardActivityPage />} />
              <Route path="tasks" element={<ScheduledTasksPage />} />
              <Route path="keys" element={<DashboardKeysPage />} />
            </Route>
            <Route path="boxset/:id" element={<BoxsetPage />} />
            <Route path="discover" element={<DiscoverPage />} />
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
