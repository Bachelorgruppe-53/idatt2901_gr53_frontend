import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { emitCareerClaimed } from "@/services/career/careerClaimEvents";
import { getLanguageCode } from "@/services/language/languageCode";
import type {
  ClaimRequest,
  ClaimResponseDto,
  QuestionAnswerDto,
  QuizMetadata,
  QuizOptionDto,
  QuizQuestionDto,
  QuizResponseDto,
  UseCareerQuizParams,
} from "@/services/types/quiz";
import type { QuizItem } from "@/src/components/quiz/quiz";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";

const extractQuizMetadata = (payload: unknown): QuizMetadata => {
  if (!payload || typeof payload !== "object") {
    return {
      maxPoints: null,
      timeLimit: null,
    };
  }

  const response = payload as Partial<QuizResponseDto>;

  return {
    maxPoints:
      typeof response.maxPoints === "number" ? response.maxPoints : null,
    timeLimit:
      typeof response.timeLimit === "number" ? response.timeLimit : null,
  };
};

/**
 * Custom hook for managing the state and logic of a career quiz. It handles fetching quiz questions, tracking answers, managing quiz completion, and submitting claims based on quiz results.
 *
 * @param {UseCareerQuizParams} params - The parameters for the useCareerQuiz hook, including careerId and onClaimSuccess callback.
 * @returns An object containing quiz state and handler functions for use in components.
 */

export function useCareerQuiz({
  careerId,
  onClaimSuccess,
}: UseCareerQuizParams) {
  const { t } = useTranslation("aboutCareer");

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizItem[]>([]);
  const [answers, setAnswers] = useState<QuestionAnswerDto[]>([]);
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [shouldAutoClaim, setShouldAutoClaim] = useState(false);
  const [quizErrorMsg, setQuizErrorMsg] = useState<string | null>(null);
  const [quizMaxPoints, setQuizMaxPoints] = useState<number | null>(null);
  const [quizTimeLimit, setQuizTimeLimit] = useState<number | null>(null);
  const isFetchingQuizRef = useRef(false);

  const toFriendlyClaimError = useCallback(
    (status: number, rawError: string): string => {
      let extractedMessage = "";
      try {
        const parsed = JSON.parse(rawError) as {
          message?: string;
          error?: string;
        };
        extractedMessage = (
          parsed.message ??
          parsed.error ??
          rawError
        ).toLowerCase();
      } catch {
        extractedMessage = rawError.toLowerCase();
      }

      if (extractedMessage.includes("already claimed")) {
        return t("alreadyClaimed", "Du har allerede fullført denne.");
      }

      if (
        extractedMessage.includes("no correct quiz answers") ||
        extractedMessage.includes("points == 0")
      ) {
        return t(
          "incorrectAnswers",
          "Feil svar! Du må svare riktig for å få poeng.",
        );
      }

      if (status === 409) {
        return t("alreadyClaimed", "Allerede registrert.");
      }

      if (status === 401) {
        return t("unauthorized", "Ugyldig sesjon.");
      }

      if (status >= 500) {
        return t("serverError", "Serveren har problemer. Prøv igjen senere.");
      }

      return t("quizClaimFailed", `Innsending feilet (Status: ${status})`);
    },
    [t],
  );

  const fetchQuizPayload = useCallback(async () => {
    if (careerId === null) {
      return null;
    }

    if (isFetchingQuizRef.current) {
      return null;
    }

    isFetchingQuizRef.current = true;
    setQuizLoading(true);
    setQuizErrorMsg(null);

    try {
      const userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const languageCode = getLanguageCode(
        i18n.resolvedLanguage ?? i18n.language,
      ).toLowerCase();

      const res = await fetch(
        `${baseUrl}/quiz/quiz/${encodeURIComponent(languageCode)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-User-ID": userId,
            "x-user-id": userId,
          },
          body: JSON.stringify({ id: careerId }),
        },
      );

      if (!res.ok) {
        throw new Error(`Quiz error: ${res.status}`);
      }

      return (await res.json()) as unknown;
    } finally {
      setQuizLoading(false);
      isFetchingQuizRef.current = false;
    }
  }, [careerId]);

  const fetchQuizPreview = useCallback(async () => {
    try {
      const payload = await fetchQuizPayload();
      if (!payload) return;

      const metadata = extractQuizMetadata(payload);
      setQuizMaxPoints(metadata.maxPoints);
      setQuizTimeLimit(metadata.timeLimit);
    } catch {
      // Keep the career view usable even if the preview fetch fails.
    }
  }, [fetchQuizPayload]);

  const fetchQuiz = useCallback(async () => {
    try {
      const payload = await fetchQuizPayload();
      if (!payload) return;

      const response = payload as Partial<QuizResponseDto>;
      const list: QuizQuestionDto[] = (response.questions ??
        []) as QuizQuestionDto[];

      const mapped: QuizItem[] = list.map((q: QuizQuestionDto) => ({
        questionId: q.id,
        question: q.questionText,
        type: q.type,
        options: q.options.map((o: QuizOptionDto) => ({
          id: o.id,
          text: o.optionText,
        })),
      }));

      const metadata = extractQuizMetadata(payload);

      setQuizQuestions(mapped);
      setQuizMaxPoints(metadata.maxPoints);
      setQuizTimeLimit(metadata.timeLimit);
      setAnswers([]);
      setQuizCompleted(false);
      setShouldAutoClaim(false);
      setQuizStartedAt(Date.now());
      setShowQuiz(true);
    } catch {
      setQuizErrorMsg(t("quizLoadFailed", "Kunne ikke laste quiz."));
    } finally {
      setQuizLoading(false);
      isFetchingQuizRef.current = false;
    }
  }, [fetchQuizPayload, t]);

  const handleAnswer = useCallback(
    (questionId: number, chosenOptionIds: number[]) => {
      setAnswers((prev) => {
        const rest = prev.filter((a) => a.questionId !== questionId);
        return [...rest, { questionId, chosenOptionIds }];
      });
    },
    [],
  );

  const handleQuizComplete = useCallback(() => {
    setQuizCompleted(true);
    setShowQuiz(false);
    setShouldAutoClaim(true);
  }, []);

  const handleClaim = useCallback(async () => {
    if (careerId === null || answers.length === 0) return;

    setShouldAutoClaim(false);
    setIsSubmittingClaim(true);
    setQuizErrorMsg(null);

    try {
      let userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");

      const responseTime = quizStartedAt
        ? Math.max(1, Math.floor((Date.now() - quizStartedAt) / 1000))
        : 1;

      const claimBody: ClaimRequest = {
        careerId,
        responseTime,
        chosenOptionIds: answers.flatMap((a) => a.chosenOptionIds),
      };

      const claimCareer = async (resolvedUserId: string) => {
        return fetch(`${baseUrl}/career/claim`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-User-ID": resolvedUserId,
            "x-user-id": resolvedUserId,
          },
          body: JSON.stringify(claimBody),
        });
      };

      const readClaimResponse = async (res: Response) => {
        const clonedResponse = res.clone();

        try {
          const parsed = (await clonedResponse.json()) as ClaimResponseDto;
          return {
            parsed,
            rawText: JSON.stringify(parsed),
          };
        } catch {
          return {
            parsed: null,
            rawText: await res.text(),
          };
        }
      };

      const handleClaimFailure = async (res: Response, userIdValue: string) => {
        const { rawText } = await readClaimResponse(res);

        if (res.status === 400 && rawText.includes("Invalid UUID format")) {
          return { retryWithNewUser: true as const };
        }

        const friendly = toFriendlyClaimError(res.status, rawText);
        setQuizErrorMsg(friendly);
        setQuizCompleted(false);
        console.log("Claim failed", {
          status: res.status,
          errorText: rawText,
          friendly,
          userId: userIdValue,
        });

        return { retryWithNewUser: false as const };
      };

      let res = await claimCareer(userId);

      if (!res.ok) {
        const failure = await handleClaimFailure(res, userId);
        if (failure.retryWithNewUser) {
          userId = await registerDevice();
          res = await claimCareer(userId);
          if (!res.ok) {
            await handleClaimFailure(res, userId);
            return;
          }
        } else {
          return;
        }
      }

      const claimResponseResult = await readClaimResponse(res);
      const claimResponse = claimResponseResult.parsed;

      if (!claimResponse?.isClaimed) {
        const friendly =
          claimResponse &&
          (claimResponse.correctAnswers === 0 || claimResponse.points === 0)
            ? t(
                "incorrectAnswers",
                "Feil svar! Du må svare riktig for å få poeng.",
              )
            : t("quizClaimFailed", "Innsending feilet.");

        setQuizErrorMsg(friendly);
        setQuizCompleted(false);
        console.log("Claim failed", {
          status: res.status,
          errorText: claimResponseResult.rawText,
          friendly,
          userId,
        });
        return;
      }

      onClaimSuccess(claimResponse);

      if (careerId !== null) {
        emitCareerClaimed(careerId);
      }
    } catch {
      setQuizErrorMsg(t("networkError", "Kunne ikke kontakte serveren."));
      setQuizCompleted(false);
    } finally {
      setIsSubmittingClaim(false);
    }
  }, [
    answers,
    careerId,
    onClaimSuccess,
    quizStartedAt,
    t,
    toFriendlyClaimError,
  ]);

  useEffect(() => {
    if (!shouldAutoClaim) return;
    if (quizQuestions.length === 0) return;
    if (answers.length < quizQuestions.length) return;
    if (isSubmittingClaim) return;

    void handleClaim();
  }, [
    answers,
    handleClaim,
    isSubmittingClaim,
    quizQuestions.length,
    shouldAutoClaim,
  ]);

  useEffect(() => {
    setShowQuiz(false);
    setQuizCompleted(false);
    setQuizLoading(false);
    setQuizQuestions([]);
    setAnswers([]);
    setQuizStartedAt(null);
    setQuizErrorMsg(null);
    setQuizMaxPoints(null);
    setQuizTimeLimit(null);
    setShouldAutoClaim(false);
  }, [careerId]);

  return {
    showQuiz,
    setShowQuiz,
    quizCompleted,
    quizLoading,
    quizQuestions,
    quizMaxPoints,
    quizTimeLimit,
    quizErrorMsg,
    isSubmittingClaim,
    fetchQuizPreview,
    fetchQuiz,
    handleAnswer,
    handleQuizComplete,
  };
}
