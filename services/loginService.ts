import axios from "axios";

const API_BASE_URL = "http://localhost:8080/admin";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const loginAdmin = async (username: string, password: string) => {
  console.log("Attempting login with:", { username, password });
  try {
    const response = await authApi.post("/login", {
      username,
      password,
    });
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutAdmin = async () => {
  try {
    await authApi.post("/logout");
  } catch (error) {
    throw error;
  }
};
