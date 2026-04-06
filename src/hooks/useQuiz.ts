import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { getLanguageCode } from "@/services/language/languageCode";
import type {
  ClaimRequest,
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
  const [quizId, setQuizId] = useState<number | null>(null);
  const [quizMaxPoints, setQuizMaxPoints] = useState<number | null>(null);
  const [quizTimeLimit, setQuizTimeLimit] = useState<number | null>(null);
  const isFetchingQuizRef = useRef(false);

  const toFriendlyClaimError = (status: number, rawError: string): string => {
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
  };

  const extractQuizId = (payload: unknown): number | null => {
    if (payload && typeof payload === "object") {
      const p = payload as QuizResponseDto;
      if (typeof p.quizId === "number") return p.quizId;
    }

    return null;
  };

  const extractQuizMetadata = (payload: unknown): QuizMetadata => {
    if (!payload || typeof payload !== "object") {
      return {
        quizId: null,
        maxPoints: null,
        timeLimit: null,
      };
    }

    const response = payload as Partial<QuizResponseDto>;

    return {
      quizId: extractQuizId(payload),
      maxPoints:
        typeof response.maxPoints === "number" ? response.maxPoints : null,
      timeLimit:
        typeof response.timeLimit === "number" ? response.timeLimit : null,
    };
  };

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
        const errorText = await res.text();
        throw new Error(`Quiz error: ${res.status}`);
      }

      return (await res.json()) as unknown;
    } finally {
      setQuizLoading(false);
      isFetchingQuizRef.current = false;
    }
  }, [careerId, i18n.language, i18n.resolvedLanguage]);

  const fetchQuizPreview = useCallback(async () => {
    try {
      const payload = await fetchQuizPayload();
      if (!payload) return;

      const metadata = extractQuizMetadata(payload);
      setQuizId(metadata.quizId);
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
      setQuizId(metadata.quizId);
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
  }, [careerId, fetchQuizPayload, t]);

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
      const resolvedQuizId = quizId;

      if (resolvedQuizId === null) {
        setQuizErrorMsg(
          t(
            "quizClaimFailed",
            "Kunne ikke finne quiz-id. Prøv å laste quizen på nytt.",
          ),
        );
        setQuizCompleted(false);
        return;
      }

      const responseTime = quizStartedAt
        ? Math.max(1, Math.floor((Date.now() - quizStartedAt) / 1000))
        : 1;

      const claimBody: ClaimRequest = {
        careerId,
        quizId: resolvedQuizId,
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

      let res = await claimCareer(userId);

      if (!res.ok) {
        const errorText = await res.text();

        if (res.status === 400 && errorText.includes("Invalid UUID format")) {
          userId = await registerDevice();
          res = await claimCareer(userId);
        } else {
          const friendly = toFriendlyClaimError(res.status, errorText);
          setQuizErrorMsg(friendly);
          setQuizCompleted(false);
          console.log("Claim failed", {
            status: res.status,
            errorText,
            friendly,
            userId,
          });
          return;
        }
      }

      if (!res.ok) {
        const errorText = await res.text();
        const friendly = toFriendlyClaimError(res.status, errorText);
        setQuizErrorMsg(friendly);
        setQuizCompleted(false);
        console.log("Claim failed", {
          status: res.status,
          errorText,
          friendly,
          userId,
        });
        return;
      }

      onClaimSuccess();
    } catch {
      setQuizErrorMsg(t("networkError", "Kunne ikke kontakte serveren."));
      setQuizCompleted(false);
    } finally {
      setIsSubmittingClaim(false);
    }
  }, [answers, careerId, onClaimSuccess, quizId, quizStartedAt, t]);

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
    quizId,
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
    setQuizId(null);
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
