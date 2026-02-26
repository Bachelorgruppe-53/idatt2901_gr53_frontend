import { getApiBaseUrl } from "@/services/apiConfig";
import {
  clearTokens,
  getToken,
  getUserId,
  saveNickname,
  saveToken,
  saveUserId,
} from "@/services/utils/secureStorage";
import axios, { isAxiosError } from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUserUuid = (value: string): boolean => UUID_REGEX.test(value);

const readUserId = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const readUserUuid = (value: unknown): string | null => {
  const userId = readUserId(value);
  if (!userId || !isValidUserUuid(userId)) {
    return null;
  }

  return userId;
};

const extractUserIdFromResponse = (data: unknown): string | null => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const directUserId =
    readUserUuid(record.userId) ??
    readUserUuid(record.user_id) ??
    readUserUuid(record.id) ??
    readUserUuid(record.sub);

  if (directUserId) {
    return directUserId;
  }

  const nestedUser = record.user;
  if (!nestedUser || typeof nestedUser !== "object") {
    return null;
  }

  const userRecord = nestedUser as Record<string, unknown>;
  return (
    readUserUuid(userRecord.userId) ??
    readUserUuid(userRecord.user_id) ??
    readUserUuid(userRecord.id) ??
    readUserUuid(userRecord.sub)
  );
};

const extractNicknameFromResponse = (data: unknown): string | null => {
  if (typeof data === "string") {
    const trimmedNickname = data.trim();
    return trimmedNickname.length > 0 ? trimmedNickname : null;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const nickname = record.nickname;
  if (typeof nickname !== "string") {
    return null;
  }

  const trimmedNickname = nickname.trim();
  return trimmedNickname.length > 0 ? trimmedNickname : null;
};

const decodeUserIdFromJwt = (token: string): string | null => {
  if (typeof globalThis.atob !== "function") {
    return null;
  }

  const segments = token.split(".");
  if (segments.length < 2) {
    return null;
  }

  try {
    const payload = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = payload.padEnd(
      Math.ceil(payload.length / 4) * 4,
      "=",
    );
    const decodedPayload = globalThis.atob(paddedPayload);
    const parsedPayload = JSON.parse(decodedPayload) as Record<string, unknown>;

    return (
      readUserUuid(parsedPayload.userId) ??
      readUserUuid(parsedPayload.user_id) ??
      readUserUuid(parsedPayload.id) ??
      readUserUuid(parsedPayload.sub)
    );
  } catch {
    return null;
  }
};

/**
 * Retrieves the current user ID, first checking secure storage, then decoding from JWT if needed.
 *
 * @returns The current user ID or null if not available
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const storedUserId = await getUserId();
  if (storedUserId && isValidUserUuid(storedUserId)) {
    return storedUserId;
  }

  const token = await getToken();
  if (!token) {
    return null;
  }

  const decodedUserId = decodeUserIdFromJwt(token);
  if (decodedUserId) {
    await saveUserId(decodedUserId);
  }

  return decodedUserId;
};

/**
 * Registers a new device user and returns the assigned UUID from backend.
 *
 * @returns The user UUID from backend
 */
export const registerDevice = async (): Promise<string> => {
  const baseUrl = getApiBaseUrl();

  const tempApi = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  try {
    const response = await tempApi.get("/user/register");

    const userIdFromHeaders =
      readUserUuid(response.headers["x-user-id"]) ??
      readUserUuid(response.headers["X-User-ID"]);
    const userIdFromBody = extractUserIdFromResponse(response.data);
    const userId = userIdFromHeaders ?? userIdFromBody;

    if (!userId) {
      console.error("Registration response headers:", response.headers);
      console.error("Registration response body:", response.data);
      throw new Error("Backend did not return a user ID in x-user-id header");
    }

    await saveUserId(userId);

    const nickname = extractNicknameFromResponse(response.data);
    if (nickname) {
      await saveNickname(nickname);
      console.log("Nickname saved from registration:", nickname);
    }

    console.log("Device registered successfully with user ID:", userId);
    return userId;
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const backendError = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

      console.error("Device registration failed:", backendError);

      throw new Error(
        `Failed to register device with backend (${baseUrl}/user/register${status ? `, status ${status}` : ""})`,
      );
    }
    throw error;
  }
};

/**
 * Ensures a user ID exists, registering the device if needed.
 *
 * @returns A valid user UUID
 */
export const ensureUserId = async (): Promise<string> => {
  const storedUserId = await getUserId();
  if (storedUserId && isValidUserUuid(storedUserId)) {
    return storedUserId;
  }

  // No valid stored UUID, register device with backend
  return await registerDevice();
};

/**
 * Authentication service for admin login and logout.
 */

/**
 * Gets the base URL for the API depending on the environment.
 *
 * @returns the base URL as a string
 */
/**
 * The base URL for the API.
 */
const API_BASE_URL = getApiBaseUrl();

/**
 * Axios instance for authentication API calls.
 */
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add authentication token to headers.
 *
 * @param config axios request configuration
 * @returns modified Axios request configuration
 */
authApi.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Logs in an admin user with the provided username and password.
 *
 * @param username The admin's username.
 * @param password The admin's password.
 * @returns The response data from the login request.
 */
export const loginAdmin = async (username: string, password: string) => {
  try {
    const response = await authApi.post("/auth/login", {
      username,
      password,
    });

    console.log("Login response status:", response.status);
    console.log("Login response headers:", response.headers);

    const authorizationHeader = response.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const cleanToken = authorizationHeader.substring(7);

      console.log("Token extracted successfully");
      console.log(cleanToken);
      await saveToken(cleanToken);

      const userIdFromResponse = extractUserIdFromResponse(response.data);
      const userIdFromToken = decodeUserIdFromJwt(cleanToken);
      const resolvedUserId = userIdFromResponse ?? userIdFromToken;
      if (resolvedUserId) {
        await saveUserId(resolvedUserId);
      }

      return {
        success: true,
        message: response.data,
      };
    } else {
      throw new Error("No authorization token in response headers");
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Axios error during login:",
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } else {
      console.error("Unexpected error during login:", error);
      throw error;
    }
  }
};

/**
 * Logs out the currently authenticated admin user.
 *
 * @returns void
 */
export const logoutAdmin = async (): Promise<void> => {
  try {
    await clearTokens();
    router.replace("/settings/admin/login");
  } catch (error) {
    await clearTokens();
    throw error;
  }
};

/**
 * Checks if the admin user is authenticated.
 *
 * @returns A promise that resolves to a boolean indicating authentication status.
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};
