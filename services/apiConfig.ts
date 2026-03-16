import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_BACKEND_PORT = "8080";
const DEFAULT_BACKEND_HOST = "10.22.24.64";

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, "");

const getHostFromExpoConfig = (): string | null => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
    2;
  }

  const host = hostUri.split(":")[0];
  return host || null;
};

const getConfiguredApiUrl = (): string | null => {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!value) {
    return null;
  }

  return trimTrailingSlash(value);
};

export const getApiBaseUrl = (): string => {
  const configuredApiUrl = getConfiguredApiUrl();
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  if (!__DEV__) {
    return `http://${DEFAULT_BACKEND_HOST}:${DEFAULT_BACKEND_PORT}`;
  }

  // Expo injects the dev machine's IP into hostUri at startup — use it when available.
  const expoHost = getHostFromExpoConfig();
  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_BACKEND_PORT}`;
  }

  // Android emulator routes host machine traffic through 10.0.2.2.
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_BACKEND_PORT}`;
  }

  return `http://${DEFAULT_BACKEND_HOST}:${DEFAULT_BACKEND_PORT}`;
};
