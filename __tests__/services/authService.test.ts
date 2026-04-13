import { getApiBaseUrl } from "@/services/apiConfig";
import {
    ensureUserId,
    getCurrentUserId,
    registerDevice,
} from "@/services/authService";
import {
    clearUserData,
    getUserId,
    saveNickname,
    saveUserId,
} from "@/services/utils/secureStorage";
import axios from "axios";

jest.mock("@/services/apiConfig", () => ({
  getApiBaseUrl: jest.fn(),
}));

jest.mock("@/services/utils/secureStorage", () => ({
  clearUserData: jest.fn(),
  getUserId: jest.fn(),
  saveNickname: jest.fn(),
  saveUserId: jest.fn(),
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
  isAxiosError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError),
}));

const mockedGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<
  typeof getApiBaseUrl
>;
const mockedGetUserId = getUserId as jest.MockedFunction<typeof getUserId>;
const mockedSaveUserId = saveUserId as jest.MockedFunction<typeof saveUserId>;
const mockedSaveNickname = saveNickname as jest.MockedFunction<
  typeof saveNickname
>;
const mockedClearUserData = clearUserData as jest.MockedFunction<
  typeof clearUserData
>;
const mockedAxiosCreate = (axios as unknown as { create: jest.Mock }).create;

describe("authService", () => {
  beforeEach(() => {
    mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080");
  });

  it("returns null from getCurrentUserId when stored value is not a UUID", async () => {
    mockedGetUserId.mockResolvedValue("not-a-uuid");

    await expect(getCurrentUserId()).resolves.toBeNull();
  });

  it("returns stored UUID from ensureUserId when valid", async () => {
    mockedGetUserId.mockResolvedValue("123e4567-e89b-12d3-a456-426614174000");

    await expect(ensureUserId()).resolves.toBe(
      "123e4567-e89b-12d3-a456-426614174000",
    );
    expect(mockedAxiosCreate).not.toHaveBeenCalled();
  });

  it("registers a new device when ensureUserId has invalid stored ID", async () => {
    mockedGetUserId.mockResolvedValue("bad-id");
    mockedAxiosCreate.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        headers: {
          "x-user-id": "123e4567-e89b-12d3-a456-426614174000",
        },
        data: {
          nickname: "Alice",
        },
      }),
    });

    await expect(ensureUserId()).resolves.toBe(
      "123e4567-e89b-12d3-a456-426614174000",
    );
    expect(mockedClearUserData).toHaveBeenCalledTimes(1);
    expect(mockedSaveUserId).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000",
    );
    expect(mockedSaveNickname).toHaveBeenCalledWith("Alice");
  });

  it("extracts userId and nickname from nested response data", async () => {
    mockedAxiosCreate.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        headers: {},
        data: {
          user: {
            id: "123e4567-e89b-12d3-a456-426614174000",
          },
          name: "Bob",
        },
      }),
    });

    await expect(registerDevice()).resolves.toBe(
      "123e4567-e89b-12d3-a456-426614174000",
    );
    expect(mockedSaveNickname).toHaveBeenCalledWith("Bob");
  });

  it("throws a descriptive error on axios registration failure", async () => {
    mockedAxiosCreate.mockReturnValue({
      get: jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: "boom" },
        },
        message: "Request failed",
      }),
    });

    await expect(registerDevice()).rejects.toThrow(
      "Failed to register device with backend (http://localhost:8080/user/register, status 500)",
    );
  });
});
