import {
  clearTokens,
  getToken,
  saveToken,
} from "@/services/utils/secureStorage";
import axios, { isAxiosError } from "axios";
import { router } from "expo-router";
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
      return "http://10.0.2.2:8080/";
    }
    return "http://localhost:8080/";
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
      console.log(cleanToken)
      await saveToken(cleanToken);
      
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
        error.response?.data?.message || "Login failed. Please try again."
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
