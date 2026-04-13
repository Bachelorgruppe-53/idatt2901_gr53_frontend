import {
    getThemePreference,
    saveThemePreference,
} from "@/services/utils/secureStorage";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import * as ReactNative from "react-native";

jest.mock("@/services/utils/secureStorage", () => ({
  getThemePreference: jest.fn(),
  saveThemePreference: jest.fn(),
}));

const mockedGetThemePreference = getThemePreference as jest.MockedFunction<
  typeof getThemePreference
>;
const mockedSaveThemePreference = saveThemePreference as jest.MockedFunction<
  typeof saveThemePreference
>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("light");
    mockedGetThemePreference.mockResolvedValue(null);
    mockedSaveThemePreference.mockResolvedValue();
  });

  it("throws when useTheme is used outside provider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within a ThemeProvider",
    );
  });

  it("uses system light mode by default", async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.themeMode).toBe("system");
      expect(result.current.isDarkMode).toBe(false);
    });
  });

  it("uses system dark mode when device is dark", async () => {
    jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("dark");

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.themeMode).toBe("system");
      expect(result.current.isDarkMode).toBe(true);
    });
  });

  it("loads saved dark theme preference", async () => {
    mockedGetThemePreference.mockResolvedValue("dark");

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.themeMode).toBe("dark");
      expect(result.current.isDarkMode).toBe(true);
    });
  });

  it("ignores invalid saved theme preference", async () => {
    mockedGetThemePreference.mockResolvedValue("invalid-theme" as any);

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.themeMode).toBe("system");
    });
  });

  it("updates theme mode and persists preference", async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode("dark");
    });

    expect(result.current.themeMode).toBe("dark");
    expect(result.current.isDarkMode).toBe(true);
    expect(mockedSaveThemePreference).toHaveBeenCalledWith("dark");
  });

  it("handles saveThemePreference failure without crashing", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedSaveThemePreference.mockRejectedValue(new Error("save failed"));

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode("light");
    });

    await waitFor(() => {
      expect(result.current.themeMode).toBe("light");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to save theme preference:",
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
