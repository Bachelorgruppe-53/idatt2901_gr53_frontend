import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import { subscribeToCareerClaimed } from "@/services/career/careerClaimEvents";
import { loadHomeSummary } from "@/services/home/loadHomeSummary";
import { getLanguageCode } from "@/services/language/languageCode";
import { getFavoriteCareer, getNickname } from "@/services/utils/secureStorage";
import { useHomeData } from "@/src/hooks/useHomeData";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

jest.mock("@/services/apiConfig");
jest.mock("@/services/authService");
jest.mock("@/services/career/careerClaimEvents");
jest.mock("@/services/home/loadHomeSummary");
jest.mock("@/services/language/languageCode");
jest.mock("@/services/utils/secureStorage");
jest.mock("expo-router");
jest.mock("react-i18next");

const mockedGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<
  typeof getApiBaseUrl
>;
const mockedEnsureUserId = ensureUserId as jest.MockedFunction<
  typeof ensureUserId
>;
const mockedSubscribeToCareerClaimed =
  subscribeToCareerClaimed as jest.MockedFunction<
    typeof subscribeToCareerClaimed
  >;
const mockedLoadHomeSummary = loadHomeSummary as jest.MockedFunction<
  typeof loadHomeSummary
>;
const mockedGetLanguageCode = getLanguageCode as jest.MockedFunction<
  typeof getLanguageCode
>;
const mockedGetNickname = getNickname as jest.MockedFunction<
  typeof getNickname
>;
const mockedGetFavoriteCareer = getFavoriteCareer as jest.MockedFunction<
  typeof getFavoriteCareer
>;
const mockedUseFocusEffect = useFocusEffect as jest.MockedFunction<
  typeof useFocusEffect
>;
const mockedUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

let appStateAddEventListenerSpy: jest.SpyInstance;

describe("useHomeData", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    appStateAddEventListenerSpy = jest
      .spyOn(AppState, "addEventListener")
      .mockReturnValue({ remove: jest.fn() } as any);

    mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");
    mockedEnsureUserId.mockResolvedValue("test-user-id");
    mockedGetLanguageCode.mockReturnValue("en");
    mockedGetNickname.mockResolvedValue("John Doe");
    mockedGetFavoriteCareer.mockResolvedValue(null);
    mockedSubscribeToCareerClaimed.mockReturnValue(() => {});
    mockedUseFocusEffect.mockImplementation(() => {});
    mockedUseTranslation.mockReturnValue({
      i18n: { language: "en", resolvedLanguage: "en" },
      t: (key: string) => key,
    } as any);

    mockedLoadHomeSummary.mockResolvedValue({
      summary: {
        nickname: "John",
        classCode: null,
        classPoints: 50,
      } as any,
      points: 100,
      classPoints: 50,
      nickname: "John",
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    appStateAddEventListenerSpy.mockRestore();
  });

  describe("initial data loading", () => {
    it("loads home data on mount", async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.points).toBeDefined();
      });

      expect(mockedLoadHomeSummary).toHaveBeenCalled();
      expect(mockedGetNickname).toHaveBeenCalled();
    });

    it("sets points from home summary", async () => {
      mockedLoadHomeSummary.mockResolvedValue({
        summary: {} as any,
        points: 250,
        classPoints: 75,
        nickname: "User",
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.points).toBe(250);
      });
    });

    it("sets class points from home summary", async () => {
      mockedLoadHomeSummary.mockResolvedValue({
        summary: {} as any,
        points: 100,
        classPoints: 80,
        nickname: "User",
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.classPoints).toBe(80);
      });
    });

    it("sets summary from home summary response", async () => {
      const summaryData = {
        nickname: "Test",
        classCode: "ABC123",
        classPoints: 50,
      };

      mockedLoadHomeSummary.mockResolvedValue({
        summary: summaryData as any,
        points: 100,
        classPoints: 50,
        nickname: "Test",
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.summary).toEqual(summaryData);
      });
    });

    it("loads favorite career on mount", async () => {
      const favoriteCareer = { id: 5, title: "Software Engineer" };
      mockedGetFavoriteCareer.mockResolvedValue(favoriteCareer as any);

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.favoriteCareer).toBeDefined();
      });
    });

    it("replaces favorite career title with localized title when available", async () => {
      mockedGetFavoriteCareer.mockResolvedValue({
        id: 5,
        title: "Old title",
      } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ title: "Localized title" }),
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.favoriteCareer).toEqual({
          id: 5,
          title: "Localized title",
        });
      });
    });

    it("keeps cached favorite career when localization request fails", async () => {
      mockedGetFavoriteCareer.mockResolvedValue({
        id: 5,
        title: "Cached title",
      } as any);
      (global.fetch as jest.Mock).mockRejectedValue(new Error("network"));

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.favoriteCareer).toEqual({
          id: 5,
          title: "Cached title",
        });
      });
    });
  });

  describe("reload functionality", () => {
    it("has a reload function", async () => {
      const { result } = renderHook(() => useHomeData());

      expect(typeof result.current.reload).toBe("function");
    });

    it("reload refreshes home data", async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(mockedLoadHomeSummary.mock.calls.length).toBeGreaterThan(0);
      });
      const initialCallCount = mockedLoadHomeSummary.mock.calls.length;

      await act(async () => {
        await result.current.reload();
      });

      await waitFor(() => {
        expect(mockedLoadHomeSummary.mock.calls.length).toBeGreaterThan(
          initialCallCount,
        );
      });
    });

    it("reload updates state with fresh data", async () => {
      mockedLoadHomeSummary.mockResolvedValue({
        summary: {} as any,
        points: 100,
        classPoints: 50,
        nickname: "Initial",
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.points).toBe(100);
      });

      mockedLoadHomeSummary.mockResolvedValue({
        summary: {} as any,
        points: 500,
        classPoints: 200,
        nickname: "Updated",
      });

      await act(async () => {
        await result.current.reload();
      });

      await waitFor(() => {
        expect(result.current.points).toBe(500);
        expect(result.current.classPoints).toBe(200);
      });
    });
  });

  describe("career claimed subscriptions", () => {
    it("subscribes to career claimed events on mount", async () => {
      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(mockedSubscribeToCareerClaimed).toHaveBeenCalled();
      });
    });

    it("reloads data when career is claimed", async () => {
      let careerClaimedCallback: ((id: number) => void) | null = null;
      mockedSubscribeToCareerClaimed.mockImplementation((callback) => {
        careerClaimedCallback = callback;
        return () => {};
      });

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(mockedLoadHomeSummary.mock.calls.length).toBeGreaterThan(0);
      });

      const initialCallCount = mockedLoadHomeSummary.mock.calls.length;

      await act(async () => {
        careerClaimedCallback?.(42);
      });

      await waitFor(() => {
        expect(mockedLoadHomeSummary.mock.calls.length).toBeGreaterThan(
          initialCallCount,
        );
      });
    });

    it("unsubscribes from career claimed on unmount", async () => {
      const unsubscribe = jest.fn();
      mockedSubscribeToCareerClaimed.mockImplementation(() => unsubscribe);

      const { unmount } = renderHook(() => useHomeData());

      unmount();

      await waitFor(() => {
        expect(unsubscribe).toHaveBeenCalled();
      });
    });
  });

  describe("app state behavior", () => {
    it("reloads when app becomes active", async () => {
      let appStateCallback: ((state: string) => void) | null = null;
      const remove = jest.fn();
      appStateAddEventListenerSpy.mockImplementation((_, cb: any) => {
        appStateCallback = cb;
        return { remove } as any;
      });

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(mockedLoadHomeSummary.mock.calls.length).toBeGreaterThan(0);
      });
      const initialCallCount = mockedLoadHomeSummary.mock.calls.length;

      act(() => {
        appStateCallback?.("active");
      });

      await waitFor(() => {
        expect(mockedLoadHomeSummary.mock.calls.length).toBeGreaterThan(
          initialCallCount,
        );
      });

      expect(remove).not.toHaveBeenCalled();
    });
  });

  describe("initial state", () => {
    it("initializes with default values", () => {
      const { result } = renderHook(() => useHomeData());

      expect(result.current.name).toBe("");
      expect(result.current.points).toBe(0);
      expect(result.current.summary).toBeNull();
      expect(result.current.classPoints).toBeNull();
      expect(result.current.favoriteCareer).toBeNull();
    });
  });

  describe("error handling", () => {
    it("continues operating if loadHomeSummary fails", async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(mockedLoadHomeSummary).toHaveBeenCalled();
      });

      mockedLoadHomeSummary.mockRejectedValueOnce(new Error("API error"));

      // Hook should still function even if one call fails
      await expect(result.current.reload()).rejects.toThrow("API error");
      expect(typeof result.current.reload).toBe("function");
    });
  });
});
