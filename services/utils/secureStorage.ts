import * as SecureStore from "expo-secure-store";

const USER_ID_KEY = "user_id";
const NICKNAME_KEY = "user_nickname";
const LANGUAGE_KEY = "app_language";
const THEME_MODE_KEY = "app_theme_mode";
const FAVORITE_CAREER_KEY = "favorite_career";

export type FavoriteCareer = {
  id: number;
  title?: string;
};

/**
 * Saves the user ID securely in the device's secure storage. 
 * This function is used to store the unique identifier for the user, which is required for making authenticated requests to the backend API.
 * The user ID is expected to be a string, and it will be stored under a predefined key.
 * If there is an error during the saving process, it will be logged and re-thrown for further handling.
 * 
 * @param userId - The user ID to be saved, which should be a string.
 */
export const saveUserId = async (userId: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_ID_KEY, userId);
  } catch (error) {
    console.error("Error saving user id:", error);
    throw error;
  }
};

/**
 * Retrieves the user ID from secure storage. This function is used to get the stored user ID when making authenticated requests to the backend API.
 * @returns The user ID as a string if it exists. If there is an error during retrieval, it will be logged and null will be returned.
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(USER_ID_KEY);
  } catch (error) {
    console.error("Error retrieving user id:", error);
    return null;
  }
};

/**
 * Deletes the stored user ID from secure storage.
 */
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
 * Store selected favorite career.
 */
export const saveFavoriteCareer = async (
  favoriteCareer: FavoriteCareer,
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(
      FAVORITE_CAREER_KEY,
      JSON.stringify(favoriteCareer),
    );
  } catch (error) {
    console.error("Error saving favorite career:", error);
    throw error;
  }
};

/**
 * Retrieve selected favorite career.
 */
export const getFavoriteCareer = async (): Promise<FavoriteCareer | null> => {
  try {
    const raw = await SecureStore.getItemAsync(FAVORITE_CAREER_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as FavoriteCareer;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.id === "number" &&
      (typeof parsed.title === "undefined" || typeof parsed.title === "string")
    ) {
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("Error retrieving favorite career:", error);
    return null;
  }
};

/**
 * Delete selected favorite career.
 */
export const deleteFavoriteCareer = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(FAVORITE_CAREER_KEY);
  } catch (error) {
    console.error("Error deleting favorite career:", error);
    throw error;
  }
};

/**
 * Delete user-scoped profile data.
 */
export const clearUserData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(NICKNAME_KEY);
    await SecureStore.deleteItemAsync(FAVORITE_CAREER_KEY);
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
};
