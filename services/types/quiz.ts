export type QuizOptionDto = {
  id: number;
  optionText: string;
};

export type QuizQuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | string;

export type QuizQuestionDto = {
  id: number;
  questionText: string;
  type: QuizQuestionType;
  options: QuizOptionDto[];
};

export type QuizResponseDto = {
  quizId: number;
  maxPoints: number;
  timeLimit: number;
  questions: QuizQuestionDto[];
};

export interface QuestionAnswerDto {
  questionId: number;
  chosenOptionIds: number[];
}

export interface ClaimRequest {
  careerId: number;
  quizId: number;
  responseTime: number;
  chosenOptionIds: number[];
}

export interface UseCareerQuizParams {
  careerId: number | null;
  onClaimSuccess: () => void;
}

export interface QuizMetadata {
  quizId: number | null;
  maxPoints: number | null;
  timeLimit: number | null;
}
