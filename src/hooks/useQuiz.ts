import { ensureUserId } from "@/services/authService";
import { getApiBaseUrl } from "@/services/apiConfig";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { QuizItem } from "../components/quiz/quiz";
import { getLanguageCode } from "@/services/language/languageCode";
import i18n from "../i18n/config";

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
  quizId: number;
  quiz?: {id?: number};
}

interface QuizResponseDto {
  id?: number;
  quizId: number;
  questions?: QuestionDto[];
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
  const [quizId, setQuizId] = useState<number | null>(null);

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

  const extractQuizId = (payload: unknown, questions: QuestionDto[]): number | null => {
    if (payload && typeof payload === "object") {
      const p = payload as QuizResponseDto;
      if (typeof p.quizId === "number") return p.quizId;
      if (typeof p.id === "number") return p.id;
    }

    const fromQuestion = questions.find(
      (q) => typeof q.quizId === "number" || typeof q.quiz?.id === "number",
    );

    if (typeof fromQuestion?.quizId === "number") return fromQuestion.quizId;
    if (typeof fromQuestion?.quiz?.id === "number") return fromQuestion.quiz.id;

    return null;
  };

  const fetchQuiz = async () => {
    if (careerId === null) {
      console.log("No career ID provided, skipping quiz fetch.");
      return;
    }

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

      const res = await fetch(`${baseUrl}/quiz/quiz/${encodeURIComponent(languageCode)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify({ id: careerId }),
      });

      console.log("fetchQuiz response", { status: res.status, ok: res.ok });

    if (!res.ok) {
        const errorText = await res.text();
        console.log("fetchQuiz failed", { status: res.status, errorText });
        throw new Error(`Quiz error: ${res.status}`);
    }

    const payload = await res.json();
    const list = Array.isArray(payload) ? payload : payload?.questions ?? [];

    const mapped: QuizItem[] = list.map((q: QuestionDto) => ({
        questionId: q.id,
        question: q.questionText,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.optionText,
        })),
      }));

      console.log("fetchQuiz mapped questions", { mapped });

      setQuizQuestions(mapped);
      setQuizId(extractQuizId(payload, list));
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
        quizId: careerId,
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
        console.log("Claim failed", { status: res.status, errorText, friendly });
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