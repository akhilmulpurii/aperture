// Auth actions
export {
  setServerUrl,
  getServerUrl,
  checkServerHealth,
  authenticateUser,
  isQuickConnectEnabled,
  initiateQuickConnect,
  getQuickConnectStatus,
  authenticateWithQuickConnect,
  logout,
  getUser,
  changeUserPassword,
  authorizeQuickConnectCode,
  isAuthenticated,
} from "./auth";

// Media actions
export {
  fetchMovies,
  fetchTVShows,
  fetchMediaDetails,
  fetchPersonDetails,
  fetchPersonFilmography,
  fetchResumeItems,
  reportPlaybackStart,
  reportPlaybackProgress,
  reportPlaybackStopped,
  fetchLibraryItems,
  fetchLiveTVItems,
  fetchSimilarItems,
  fetchMovieByCollection,
  scanLibrary,
  markFavorite,
  unmarkFavorite,
} from "./media";

// TV show actions
export {
  fetchSeasons,
  fetchEpisodes,
  fetchTVShowDetails,
  fetchEpisodeDetails,
} from "./tv-shows";

// Search actions
export { searchItems, searchPeople } from "./search";

// Utility actions
export {
  getImageUrl,
  getUserImageUrl,
  uploadUserImage,
  getDownloadUrl,
  getStreamUrl,
  getDirectStreamUrl,
  getThemeSongStreamUrl,
  getThemeVideoStreamUrl,
  getSubtitleTracks,
  getAudioTracks,
  getUserLibraries,
  getLibraryById,
  getLiveTVStreamUrl,
  fetchRemoteImages,
  downloadRemoteImage,
  fetchCurrentImages,
  reorderBackdropImage,
  deleteImage,
  getUserById,
  getUserWithPolicy,
  fetchScheduledTasks,
  fetchJellyfinLogs,
  fetchSystemInfo,
  restartServer,
  shutdownServer,
  canBrowserDirectPlayHevc,
  fetchUsers,
  updateUser,
  updateUserPolicy,
  fetchMediaFolders,
} from "./utils";
export { discoverLocalServer } from "./discovery";
export {
  fetchDashboardGeneralData,
  updateDashboardConfiguration,
} from "./dashboard-general";
export {
  fetchDefaultDirectoryBrowser,
  fetchDrives,
  fetchDirectoryContents,
  fetchParentPath,
} from "./file-browser";
export {
  fetchApiKeys,
  normalizeApiKeys,
  createApiKey,
  revokeApiKey,
} from "./api-keys";
export {
  fetchScheduledTasksList,
  startScheduledTask,
  stopScheduledTask,
  updateTaskTriggers,
} from "./scheduled-tasks";
export { fetchActivityLogEntries } from "./activity-log";

// Types
export type {
  RemoteImage,
  RemoteImagesResponse,
  CurrentImage,
  UserWithPolicy,
} from "./utils";
export type { QuickConnectResult } from "./auth";
