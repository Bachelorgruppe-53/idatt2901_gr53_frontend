import {
  clearTokens,
  getToken,
  saveToken,
} from "@/services/utils/secureStorage";
import axios, { isAxiosError } from "axios";
import { Platform } from "react-native";

/**
 * Authentication service for admin login and logout.
 */

/**
 * Gets the base URL for the API depending on the environment.
 *
 * @returns the base URL as a string
 */
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:8080/admin";
    }
    return "http://localhost:8080/admin";
  }
  return ""; // TODO: Set production URL here
};

/**
 * The base URL for the API.
 */
const API_BASE_URL = getBaseURL();

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
    const response = await authApi.post("/login", {
      username,
      password,
    });

    if (response.data.token) {
      await saveToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Axios error during login:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Unexpected error during login:", error);
    }
    throw error;
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
