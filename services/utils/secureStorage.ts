import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "admin_auth_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const USER_ID_KEY = "user_id";
const NICKNAME_KEY = "user_nickname";
const LANGUAGE_KEY = "app_language";
const THEME_MODE_KEY = "app_theme_mode";

/**
 * Store authentication token securely
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error saving token:", error);
    throw error;
  }
};

/**
 * Retrieve stored authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

/**
 * Delete stored authentication token
 */
export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error deleting token:", error);
    throw error;
  }
};

/**
 * Store refresh token securely
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error saving refresh token:", error);
    throw error;
  }
};

/**
 * Retrieve stored refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

export const saveUserId = async (userId: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_ID_KEY, userId);
  } catch (error) {
    console.error("Error saving user id:", error);
    throw error;
  }
};

export const getUserId = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error("Error retrieving user id:", error);
    return null;
  }
};

export const deleteUserId = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error("Error deleting user id:", error);
    throw error;
  }
};

/**
 * Store user nickname securely.
 */
export const saveNickname = async (nickname: string): Promise<void> => {
  try {
    console.log("Saving nickname:", nickname);
    await SecureStore.setItemAsync(NICKNAME_KEY, nickname);
  } catch (error) {
    console.error("Error saving nickname:", error);
    throw error;
  }
};

/**
 * Retrieve stored user nickname.
 */
export const getNickname = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(NICKNAME_KEY);
  } catch (error) {
    console.error("Error retrieving nickname:", error);
    return null;
  }
};

/**
 * Delete stored user nickname.
 */
export const deleteNickname = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(NICKNAME_KEY);
  } catch (error) {
    console.error("Error deleting nickname:", error);
    throw error;
  }
};

/**
 * Store selected app language securely.
 */
export const saveLanguagePreference = async (
  languageCode: string,
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(LANGUAGE_KEY, languageCode);
  } catch (error) {
    console.error("Error saving language preference:", error);
    throw error;
  }
};

/**
 * Retrieve selected app language.
 */
export const getLanguagePreference = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(LANGUAGE_KEY);
  } catch (error) {
    console.error("Error retrieving language preference:", error);
    return null;
  }
};

/**
 * Store selected app theme mode securely.
 */
export const saveThemePreference = async (themeMode: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(THEME_MODE_KEY, themeMode);
  } catch (error) {
    console.error("Error saving theme preference:", error);
    throw error;
  }
};

/**
 * Retrieve selected app theme mode.
 */
export const getThemePreference = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(THEME_MODE_KEY);
  } catch (error) {
    console.error("Error retrieving theme preference:", error);
    return null;
  }
};

/**
 * Delete all stored tokens
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    await SecureStore.deleteItemAsync(NICKNAME_KEY);
  } catch (error) {
    console.error("Error clearing tokens:", error);
    throw error;
  }
};
