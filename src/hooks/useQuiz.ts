import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { getLanguageCode } from "@/services/language/languageCode";
import type {
  QuizItem,
  QuizOptionDto,
  QuizQuestionDto,
  QuizResponseDto,
} from "@/src/components/quiz/quiz";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";

/**
 * Custom hook for managing the state and logic of a career quiz. It handles fetching quiz questions, tracking answers, managing quiz completion, and submitting claims based on quiz results.
 *
 * @param {UseCareerQuizParams} params - The parameters for the useCareerQuiz hook, including careerId and onClaimSuccess callback.
 * @returns An object containing quiz state and handler functions for use in components.
 */

interface QuestionAnswerDto {
  questionId: number;
  chosenOptionIds: number[];
}

interface ClaimRequest {
  careerId: number;
  quizId: number;
  responseTime: number;
  chosenOptionIds: number[];
}

interface UseCareerQuizParams {
  careerId: number | null;
  onClaimSuccess: () => void;
}

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

  const fetchQuiz = async () => {
    if (careerId === null) {
      console.log("No career ID provided, skipping quiz fetch.");
      return;
    }

    if (isFetchingQuizRef.current) {
      console.log("fetchQuiz skipped: request already in progress");
      return;
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

      const url = `${baseUrl}/quiz/quiz/${encodeURIComponent(languageCode)}`;
      console.log("fetchQuiz start", { careerId, languageCode, url });

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

      console.log("fetchQuiz response", { status: res.status, ok: res.ok });

      if (!res.ok) {
        const errorText = await res.text();
        console.log("fetchQuiz failed", { status: res.status, errorText });
        throw new Error(`Quiz error: ${res.status}`);
      }

      const payload = await res.json();
      const response = payload as Partial<QuizResponseDto>;
      const list: QuizQuestionDto[] = Array.isArray(payload)
        ? (payload as QuizQuestionDto[])
        : ((response.questions ?? []) as QuizQuestionDto[]);

      const mapped: QuizItem[] = list.map((q: QuizQuestionDto) => ({
        questionId: q.id,
        question: q.questionText,
        type: q.type,
        options: q.options.map((o: QuizOptionDto) => ({
          id: o.id,
          text: o.optionText
        })),
      }));

      console.log("fetchQuiz mapped questions", { mapped });

      const resolvedQuizId = extractQuizId(payload);

      setQuizQuestions(mapped);
      setQuizId(resolvedQuizId);
      setAnswers([]);
      setQuizCompleted(false);
      setShouldAutoClaim(false);
      setQuizStartedAt(Date.now());
      setShowQuiz(true);

      if (resolvedQuizId === null) {
        console.log("fetchQuiz could not resolve quizId from response", {
          careerId,
          payloadType: Array.isArray(payload) ? "array" : typeof payload,
        });
      }
    } catch {
      setQuizErrorMsg(t("quizLoadFailed", "Kunne ikke laste quiz."));
    } finally {
      setQuizLoading(false);
      isFetchingQuizRef.current = false;
    }
  };

  const handleAnswer = (questionId: number, chosenOptionIds: number[]) => {
    setAnswers((prev) => {
      const rest = prev.filter((a) => a.questionId !== questionId);
      return [...rest, { questionId, chosenOptionIds }];
    });
  };

  const handleQuizComplete = () => {
    console.log("quiz complete", {
      answersCount: answers.length,
      questionsCount: quizQuestions.length,
      quizId,
    });
    setQuizCompleted(true);
    setShowQuiz(false);
    setShouldAutoClaim(true);
  };

  const handleClaim = async () => {
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

      console.log("claim start", {
        careerId,
        quizId: resolvedQuizId,
        answersCount: answers.length,
      });

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

      console.log("claim response", { status: res.status, ok: res.ok });

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
  };

  useEffect(() => {
    if (!shouldAutoClaim) return;
    if (quizQuestions.length === 0) return;
    if (answers.length < quizQuestions.length) return;
    if (isSubmittingClaim) return;

    console.log("auto-claim triggered", {
      answersCount: answers.length,
      questionsCount: quizQuestions.length,
      quizId,
    });

    void handleClaim();
  }, [shouldAutoClaim, answers, quizQuestions.length, isSubmittingClaim]);

  return {
    showQuiz,
    setShowQuiz,
    quizCompleted,
    quizLoading,
    quizQuestions,
    quizErrorMsg,
    isSubmittingClaim,
    fetchQuiz,
    handleAnswer,
    handleQuizComplete,
  };
}
