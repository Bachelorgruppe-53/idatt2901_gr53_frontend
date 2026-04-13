import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import { useLeaveClass } from "@/src/hooks/useLeaveClass";
import { act, renderHook } from "@testing-library/react-native";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

jest.mock("@/services/apiConfig");
jest.mock("@/services/authService");
jest.mock("axios");
jest.mock("react-i18next");

const mockedGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<
  typeof getApiBaseUrl
>;
const mockedEnsureUserId = ensureUserId as jest.MockedFunction<
  typeof ensureUserId
>;
const mockedAxiosPut = axios.put as jest.MockedFunction<typeof axios.put>;
const mockedUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;
let mockedAlert: jest.SpyInstance;

describe("useLeaveClass", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAlert = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");
    mockedEnsureUserId.mockResolvedValue("user-1");
    mockedAxiosPut.mockResolvedValue({} as any);
    mockedUseTranslation.mockReturnValue({
      t: (key: string, fallback?: string) => fallback ?? key,
      i18n: { language: "en", resolvedLanguage: "en" },
    } as any);
  });

  afterEach(() => {
    mockedAlert.mockRestore();
  });

  it("shows confirmation alert when leaveClass is called", () => {
    const { result } = renderHook(() => useLeaveClass());

    act(() => {
      result.current.leaveClass();
    });

    expect(mockedAlert).toHaveBeenCalled();
    expect(mockedAlert.mock.calls[0][0]).toBe("Leave class");
  });

  it("leaves class successfully and calls onLeft", async () => {
    const onLeft = jest.fn();
    const { result } = renderHook(() => useLeaveClass(onLeft));

    act(() => {
      result.current.leaveClass();
    });

    const buttons = mockedAlert.mock.calls[0][2] as Array<{
      onPress?: () => void | Promise<void>;
      text: string;
    }>;

    await buttons[1].onPress?.();

    expect(mockedEnsureUserId).toHaveBeenCalled();
    expect(mockedAxiosPut).toHaveBeenCalledWith(
      "http://localhost:8080/user/leave",
      {},
      { headers: { "X-User-ID": "user-1" } },
    );
    expect(onLeft).toHaveBeenCalled();
  });

  it("shows error alert when leaving class fails", async () => {
    mockedAxiosPut.mockRejectedValue(new Error("request failed"));

    const { result } = renderHook(() => useLeaveClass());

    act(() => {
      result.current.leaveClass();
    });

    const buttons = mockedAlert.mock.calls[0][2] as Array<{
      onPress?: () => void | Promise<void>;
      text: string;
    }>;

    await buttons[1].onPress?.();

    expect(mockedAlert).toHaveBeenCalledWith(
      "Error",
      "Failed to leave class. Please try again.",
    );
  });
});
