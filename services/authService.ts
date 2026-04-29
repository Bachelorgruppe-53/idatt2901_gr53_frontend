import { getApiBaseUrl } from "@/services/apiConfig";
import {
    clearUserData,
    getUserId,
    saveNickname,
    saveUserId,
} from "@/services/utils/secureStorage";
import axios, { isAxiosError } from "axios";

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
  const nickname = record.nickname ?? record.name;
  if (typeof nickname !== "string") {
    return null;
  }

  const trimmedNickname = nickname.trim();
  return trimmedNickname.length > 0 ? trimmedNickname : null;
};

/**
 * Retrieves the current user ID from secure storage.
 *
 * @returns The current user ID or null if not available
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const storedUserId = await getUserId();
  if (storedUserId && isValidUserUuid(storedUserId)) {
    return storedUserId;
  }

  return null;
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
    console.log("[registerDevice] response.data:", response.data);
    console.log("[registerDevice] response.data type:", typeof response.data);

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

    await clearUserData();
    await saveUserId(userId);

    const nickname = extractNicknameFromResponse(response.data);
    console.log("[registerDevice] extracted nickname:", nickname);
    console.log("[registerDevice] extracted nickname type:", typeof nickname);

    if (nickname && typeof nickname === "string") {
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

  return await registerDevice();
};
