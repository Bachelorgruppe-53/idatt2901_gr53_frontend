import { ensureUserId } from "@/services/authService";
import { getApiBaseUrl } from "@/services/apiConfig";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { QuizItem } from "../components/quiz/quiz";

/**
 * Custom hook for managing the state and logic of a career quiz. It handles fetching quiz questions, tracking answers, managing quiz completion, and submitting claims based on quiz results.
 * 
 * @param {UseCareerQuizParams} params - The parameters for the useCareerQuiz hook, including careerId and onClaimSuccess callback.
 * @returns An object containing quiz state and handler functions for use in components.
 */

interface QuizOptionDto {
  id: number;
  optionText: string;
}

interface QuestionDto {
  id: number;
  questionText: string;
  type: string;
  options: QuizOptionDto[];
}

interface QuestionAnswerDto {
  questionId: number;
  chosenOptionIds: number[];
}

interface ClaimRequest {
  poiId: number;
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

  const toFriendlyClaimError = (status: number, rawError: string): string => {
    let extractedMessage = "";
    try {
      const parsed = JSON.parse(rawError) as { message?: string; error?: string };
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

  const fetchQuiz = async () => {
    if (careerId === null) return;

    setQuizLoading(true);
    setQuizErrorMsg(null);

    try {
      const userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");

      const res = await fetch(`${baseUrl}/quiz/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify({ id: careerId }),
      });

      if (!res.ok) {
        throw new Error(`Quiz error: ${res.status}`);
      }

      const json = (await res.json()) as QuestionDto[];
      const mapped: QuizItem[] = json.map((q) => ({
        questionId: q.id,
        question: q.questionText,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.optionText,
        })),
      }));

      setQuizQuestions(mapped);
      setAnswers([]);
      setQuizCompleted(false);
      setShouldAutoClaim(false);
      setQuizStartedAt(Date.now());
      setShowQuiz(true);
    } catch {
      setQuizErrorMsg(t("quizLoadFailed", "Kunne ikke laste quiz."));
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswer = (questionId: number, chosenOptionIds: number[]) => {
    setAnswers((prev) => {
      const rest = prev.filter((a) => a.questionId !== questionId);
      return [...rest, { questionId, chosenOptionIds }];
    });
  };

  const handleQuizComplete = () => {
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
      const userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const responseTime = quizStartedAt
        ? Math.max(1, Math.floor((Date.now() - quizStartedAt) / 1000))
        : 1;

      const claimBody: ClaimRequest = {
        poiId: careerId,
        quizId: 1,
        responseTime,
        chosenOptionIds: answers.flatMap((a) => a.chosenOptionIds),
      };

      const res = await fetch(`${baseUrl}/career/claim`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify(claimBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        const friendly = toFriendlyClaimError(res.status, errorText);
        setQuizErrorMsg(friendly);
        setQuizCompleted(false);
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
    if (answers.length !== quizQuestions.length) return;
    if (isSubmittingClaim) return;

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