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
  getUserWithPolicy,
  fetchScheduledTasks,
  fetchJellyfinLogs,
  fetchSystemInfo,
  restartServer,
  shutdownServer,
} from "./utils";
export { discoverLocalServer } from "./discovery";

// Types
export type {
  RemoteImage,
  RemoteImagesResponse,
  CurrentImage,
  UserPolicy,
  UserWithPolicy,
} from "./utils";
export type { QuickConnectResult } from "./auth";
