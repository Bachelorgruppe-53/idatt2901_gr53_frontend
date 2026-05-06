import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_BACKEND_PORT = "8080";
const DEFAULT_BACKEND_HOST = "localhost";

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, "");

/**
 * Determines the base URL for the backend API based on the environment and configuration.
 * @returns The base URL for the backend API as a string. The function checks for a configured API URL, uses the Android emulator bridge in development on Android, uses Expo's hostUri in development on iOS, and falls back to localhost otherwise.
 */
const getHostFromExpoConfig = (): string | null => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(":")[0];
  return host || null;
};

/**
 * Retrieves the configured API URL from the environment variable EXPO_PUBLIC_API_URL.
 * If the variable is not set or is empty, it returns null.
 * If it is set, it trims any trailing slash from the URL before returning it.
 * @returns The configured API URL as a string, or null if it is not set or empty.
 */
const getConfiguredApiUrl = (): string | null => {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!value) {
    return null;
  }

  return trimTrailingSlash(value);
};

/**
 * Determines the base URL for the backend API based on the environment and configuration.
 * It checks for a configured API URL, uses the Android emulator bridge in development on Android, uses Expo's hostUri in development on iOS, and falls back to defaults based on the platform and environment.
 * @returns The base URL for the backend API as a string.
 *
 * The priority for determining the API base URL is as follows:
 * 1. If EXPO_PUBLIC_API_URL environment variable is set, it will be used after trimming any trailing slash.
 * 2. If not in development mode, returns http://localhost:8080 (DEFAULT_BACKEND_HOST:PORT).
 * 3. On Android in development mode, always returns http://10.0.2.2:8080 (emulator host bridge).
 * 4. In development mode on iOS, if Expo hostUri is available, uses that: http://{hostUri}:8080.
 * 5. Otherwise, returns http://localhost:8080 (DEFAULT_BACKEND_HOST:PORT).
 */
export const getApiBaseUrl = (): string => {
  const configuredApiUrl = getConfiguredApiUrl();
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  if (!__DEV__) {
    return `http://${DEFAULT_BACKEND_HOST}:${DEFAULT_BACKEND_PORT}`;
  }

  // Android development runs use the emulator bridge.
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_BACKEND_PORT}`;
  }

  // Expo injects the dev machine's IP into hostUri at startup — use it when available.
  const expoHost = getHostFromExpoConfig();
  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_BACKEND_PORT}`;
  }

  return `http://${DEFAULT_BACKEND_HOST}:${DEFAULT_BACKEND_PORT}`;
};
