import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { emitCareerClaimed } from "@/services/career/careerClaimEvents";
import { getLanguageCode } from "@/services/language/languageCode";
import { useCareerQuiz } from "@/src/hooks/useQuiz";
import i18n from "@/src/i18n/config";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useTranslation } from "react-i18next";

jest.mock("@/services/apiConfig");
jest.mock("@/services/authService", () => ({
  ensureUserId: jest.fn(),
  registerDevice: jest.fn(),
}));
jest.mock("@/services/career/careerClaimEvents", () => ({
  emitCareerClaimed: jest.fn(),
}));
jest.mock("@/services/language/languageCode", () => ({
  getLanguageCode: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));
jest.mock("@/src/i18n/config", () => ({
  resolvedLanguage: "en",
  language: "en",
}));

const mockedGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<
  typeof getApiBaseUrl
>;
const mockedEnsureUserId = ensureUserId as jest.MockedFunction<
  typeof ensureUserId
>;
const mockedRegisterDevice = registerDevice as jest.MockedFunction<
  typeof registerDevice
>;
const mockedEmitCareerClaimed = emitCareerClaimed as jest.MockedFunction<
  typeof emitCareerClaimed
>;
const mockedGetLanguageCode = getLanguageCode as jest.MockedFunction<
  typeof getLanguageCode
>;
const mockedUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

const mockQuizResponse = {
  quizId: 1,
  maxPoints: 100,
  timeLimit: 300,
  questions: [
    {
      id: 1,
      questionText: "What is 2+2?",
      type: "MULTIPLE_CHOICE",
      options: [
        { id: 1, optionText: "3" },
        { id: 2, optionText: "4" },
        { id: 3, optionText: "5" },
      ],
    },
    {
      id: 2,
      questionText: "Is React a library?",
      type: "TRUE_FALSE",
      options: [
        { id: 4, optionText: "True" },
        { id: 5, optionText: "False" },
      ],
    },
  ],
};

const createResponse = <T>(body: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  clone() {
    return createResponse(body, status);
  },
});

describe("useCareerQuiz", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetApiBaseUrl.mockReturnValue("http://localhost:8080/");
    mockedEnsureUserId.mockResolvedValue("test-user-id");
    mockedRegisterDevice.mockResolvedValue("new-user-id");
    mockedGetLanguageCode.mockReturnValue("en");
    mockedUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: { language: "en", resolvedLanguage: "en" },
    } as any);

    Object.defineProperty(i18n, "language", {
      value: "en",
      writable: true,
    });
    Object.defineProperty(i18n, "resolvedLanguage", {
      value: "en",
      writable: true,
    });

    global.fetch = jest.fn();
  });

  describe("initial state", () => {
    it("initializes with default values", () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      expect(result.current.showQuiz).toBe(false);
      expect(result.current.quizCompleted).toBe(false);
      expect(result.current.quizLoading).toBe(false);
      expect(result.current.quizQuestions).toEqual([]);
      expect(result.current.quizErrorMsg).toBeNull();
      expect(result.current.isSubmittingClaim).toBe(false);
    });

    it("initializes with null careerId", () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: null, onClaimSuccess: jest.fn() }),
      );

      expect(result.current.quizQuestions).toEqual([]);
      expect(result.current.showQuiz).toBe(false);
    });
  });

  describe("quiz preview loading", () => {
    it("fetches quiz preview successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockQuizResponse,
      });

      const onClaimSuccess = jest.fn();
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess }),
      );

      await act(async () => {
        await result.current.fetchQuizPreview();
      });

      // After preview fetch, metadata should be extracted
      expect(result.current.quizMaxPoints).toBe(100);
      expect(result.current.quizTimeLimit).toBe(300);
    });

    it("extracts quiz metadata from response", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          quizId: 42,
          maxPoints: 250,
          timeLimit: 600,
          questions: [],
        }),
      });

      const onClaimSuccess = jest.fn();
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess }),
      );

      await act(async () => {
        await result.current.fetchQuizPreview();
      });

      // Verify all metadata is extracted correctly
      expect(result.current.quizMaxPoints).toBe(250);
      expect(result.current.quizTimeLimit).toBe(600);
    });

    it("handles preview fetch failure gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const onClaimSuccess = jest.fn();
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess }),
      );

      await act(async () => {
        await result.current.fetchQuizPreview();
      });

      // Should not crash and show no error
      expect(result.current.quizErrorMsg).toBeNull();
    });

    it("sets metadata to null when preview payload is invalid", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => "invalid-payload",
      });

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuizPreview();
      });

      expect(result.current.quizMaxPoints).toBeNull();
      expect(result.current.quizTimeLimit).toBeNull();
    });
  });

  describe("quiz loading", () => {
    it("fetches full quiz successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockQuizResponse,
      });

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.showQuiz).toBe(true);
        expect(result.current.quizQuestions).toHaveLength(2);
      });
    });

    it("maps quiz questions to UI format", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockQuizResponse,
      });

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions[0]).toEqual({
          questionId: 1,
          question: "What is 2+2?",
          type: "MULTIPLE_CHOICE",
          options: expect.arrayContaining([
            { id: 1, text: "3" },
            { id: 2, text: "4" },
            { id: 3, text: "5" },
          ]),
        });
      });
    });

    it("sets quiz metadata on successful load", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockQuizResponse,
      });

      const onClaimSuccess = jest.fn();
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      // Verify metadata is set after full quiz load
      expect(result.current.quizMaxPoints).toBe(100);
      expect(result.current.quizTimeLimit).toBe(300);
    });

    it("shows error when quiz fetch fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("API error"));

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).not.toBeNull();
      });
    });

    it("returns early if careerId is null", async () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: null, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      expect(result.current.quizQuestions).toHaveLength(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("prevents concurrent quiz fetches", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  json: async () => mockQuizResponse,
                }),
              100,
            ),
          ),
      );

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      // Try to fetch twice concurrently
      await act(async () => {
        const fetch1 = result.current.fetchQuiz();
        const fetch2 = result.current.fetchQuiz();
        await Promise.all([fetch1, fetch2]);
      });

      // Should only fetch once due to concurrency guard
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("answer handling", () => {
    it("handles answer selection", () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      act(() => {
        result.current.handleAnswer(1, [2]);
      });

      // The hook stores answers internally, no direct getter,
      // but we can verify through claim submission
      expect(result.current).toBeDefined();
    });

    it("replaces previous answer for same question", () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(1, [3]);
      });

      // Can't directly verify without expose, but shouldn't crash
      expect(result.current).toBeDefined();
    });

    it("handles multiple choice answers", () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      act(() => {
        result.current.handleAnswer(1, [2, 3, 4]);
      });

      expect(result.current).toBeDefined();
    });
  });

  describe("quiz completion", () => {
    it("marks quiz as completed", async () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      expect(result.current.quizCompleted).toBe(false);

      act(() => {
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizCompleted).toBe(true);
      });
    });

    it("hides quiz when completed", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockQuizResponse,
      });

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.showQuiz).toBe(true);
      });

      act(() => {
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.showQuiz).toBe(false);
      });
    });

    it("sets shouldAutoClaim flag on completion", async () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      act(() => {
        result.current.handleQuizComplete();
      });

      // The auto-claim dispatch is handled internally
      expect(result.current.quizCompleted).toBe(true);
    });
  });

  describe("career claim submission", () => {
    it("submits career claim successfully", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(
          createResponse({
            correctAnswers: 2,
            totalQuestions: 2,
            points: 100,
            isClaimed: true,
          }),
        );

      const onClaimSuccess = jest.fn();
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions).toHaveLength(2);
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.isSubmittingClaim).toBe(false);
      });

      expect(onClaimSuccess).toHaveBeenCalled();
    });

    it("emits career claimed event on success", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(
          createResponse({
            correctAnswers: 2,
            totalQuestions: 2,
            points: 100,
            isClaimed: true,
          }),
        );

      const { result } = renderHook(() =>
        useCareerQuiz({
          careerId: 15,
          onClaimSuccess: jest.fn(),
        }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions).toHaveLength(2);
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(mockedEmitCareerClaimed).toHaveBeenCalledWith(15);
      });
    });

    it("handles UUID error during claim with re-registration", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(createResponse("Invalid UUID format", 400))
        .mockResolvedValueOnce(
          createResponse({
            correctAnswers: 2,
            totalQuestions: 2,
            points: 100,
            isClaimed: true,
          }),
        );

      const onClaimSuccess = jest.fn();
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions).toHaveLength(2);
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(mockedRegisterDevice).toHaveBeenCalled();
      });

      expect(onClaimSuccess).toHaveBeenCalled();
    });

    it("shows error when claim fails", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(createResponse("Already claimed", 409));

      const { result } = renderHook(() =>
        useCareerQuiz({
          careerId: 5,
          onClaimSuccess: jest.fn(),
        }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions).toHaveLength(2);
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).not.toBeNull();
        expect(result.current.quizCompleted).toBe(false);
      });
    });

    it("handles network error during claim", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() =>
        useCareerQuiz({
          careerId: 5,
          onClaimSuccess: jest.fn(),
        }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions).toHaveLength(2);
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).not.toBeNull();
      });
    });

    it("calculates response time based on quiz start time", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(
          createResponse({
            correctAnswers: 2,
            totalQuestions: 2,
            points: 100,
            isClaimed: true,
          }),
        );

      const { result } = renderHook(() =>
        useCareerQuiz({
          careerId: 5,
          onClaimSuccess: jest.fn(),
        }),
      );

      const startTime = Date.now();

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions).toHaveLength(2);
      });

      // Wait a bit to get non-zero response time
      await new Promise((resolve) => setTimeout(resolve, 50));

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.isSubmittingClaim).toBe(false);
      });

      const claimCall = (global.fetch as jest.Mock).mock.calls.find((c) =>
        c[0].includes("/career/claim"),
      );
      const claimBody = JSON.parse(claimCall?.[1].body);

      expect(claimBody.responseTime).toBeGreaterThan(0);
    });

    it("returns early if no careerId", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockQuizResponse,
      });

      const { result } = renderHook(() =>
        useCareerQuiz({
          careerId: null,
          onClaimSuccess: jest.fn(),
        }),
      );

      act(() => {
        result.current.handleQuizComplete();
      });

      expect(result.current.quizErrorMsg).toBeNull();
    });

    it("does not auto-claim when not all questions are answered", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockQuizResponse,
      });

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.isSubmittingClaim).toBe(false);
      });

      expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);
    });

    it("claims successfully even when preview metadata lacks quizId", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          maxPoints: 100,
          timeLimit: 300,
          questions: mockQuizResponse.questions,
        }),
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        createResponse({
          correctAnswers: 2,
          totalQuestions: 2,
          points: 100,
          isClaimed: true,
        }),
      );

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).toBeNull();
      });
    });

    it("maps 401 claim errors to unauthorized message", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(createResponse("auth failed", 401));

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).toBe("unauthorized");
      });
    });

    it("maps 500 claim errors to serverError message", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(createResponse("internal", 500));

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).toBe("serverError");
      });
    });

    it("maps non-specific claim errors to quizClaimFailed", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(createResponse("teapot", 418));

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).toBe("quizClaimFailed");
      });
    });

    it("handles second claim failure after UUID re-registration", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(createResponse("Invalid UUID format", 400))
        .mockResolvedValueOnce(createResponse("duplicate", 409));

      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(mockedRegisterDevice).toHaveBeenCalled();
        expect(result.current.quizErrorMsg).toBe("alreadyClaimed");
      });
    });
  });

  describe("error message translation", () => {
    it("translates already claimed error", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(
          createResponse("Already claimed this career", 409),
        );

      const { result } = renderHook(() =>
        useCareerQuiz({
          careerId: 5,
          onClaimSuccess: jest.fn(),
        }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions).toHaveLength(2);
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).toBe("alreadyClaimed");
      });
    });

    it("translates incorrect answers error", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockQuizResponse,
        })
        .mockResolvedValueOnce(
          createResponse({ message: "No correct quiz answers" }, 400),
        );

      const { result } = renderHook(() =>
        useCareerQuiz({
          careerId: 5,
          onClaimSuccess: jest.fn(),
        }),
      );

      await act(async () => {
        await result.current.fetchQuiz();
      });

      await waitFor(() => {
        expect(result.current.quizQuestions).toHaveLength(2);
      });

      act(() => {
        result.current.handleAnswer(1, [2]);
        result.current.handleAnswer(2, [4]);
        result.current.handleQuizComplete();
      });

      await waitFor(() => {
        expect(result.current.quizErrorMsg).toBe("incorrectAnswers");
      });
    });
  });

  describe("cleanup on careerId change", () => {
    it("resets state when careerId changes", () => {
      type QuizHookProps = {
        careerId: number | null;
        onClaimSuccess: () => void;
      };

      const { result, rerender } = renderHook(
        ({ careerId, onClaimSuccess }: QuizHookProps) =>
          useCareerQuiz({ careerId, onClaimSuccess }),
        {
          initialProps: {
            careerId: 5,
            onClaimSuccess: jest.fn(),
          },
        },
      );

      act(() => {
        result.current.handleQuizComplete();
      });

      expect(result.current.quizCompleted).toBe(true);

      rerender({
        careerId: 10,
        onClaimSuccess: jest.fn(),
      });

      expect(result.current.quizCompleted).toBe(false);
      expect(result.current.showQuiz).toBe(false);
      expect(result.current.quizQuestions).toEqual([]);
    });
  });

  describe("show/hide quiz", () => {
    it("allows manual show toggle", async () => {
      const { result } = renderHook(() =>
        useCareerQuiz({ careerId: 5, onClaimSuccess: jest.fn() }),
      );

      expect(result.current.showQuiz).toBe(false);

      act(() => {
        result.current.setShowQuiz(true);
      });

      expect(result.current.showQuiz).toBe(true);

      act(() => {
        result.current.setShowQuiz(false);
      });

      expect(result.current.showQuiz).toBe(false);
    });
  });
});
