import type { QuizItem } from "@/src/components/quiz/quiz";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Quiz from "./quiz";

/**
 * QuizModal component that displays a quiz in a modal view.
 * It shows the quiz title, questions, and handles the quiz logic such as timing and scoring.
 * 
 * @returns JSX.Element
 * 
 */

interface QuizModalProps {
  visible: boolean;
  title?: string;
  questions?: QuizItem[];
  isLoading?: boolean;
  maxPoints?: number | null;
  timeLimit?: number | null;
  startedAt?: number | null;
  onAnswer: (questionId: number, chosenOptionIds: number[]) => void;
  onComplete?: () => void;
  onClose: () => void;
}

export default function QuizModal({
  visible,
  title,
  questions,
  isLoading = false,
  maxPoints,
  timeLimit,
  startedAt,
  onAnswer,
  onComplete,
  onClose,
}: QuizModalProps) {
  const themedStyles = useThemedStyles();
  const theme = useThemeColor();
  const { t } = useTranslation("quiz");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const getRemainingSeconds = useCallback(
    (limit: number, startTimestamp: number) => {
      const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
      return Math.max(0, limit - elapsedSeconds);
    },
    [],
  );

  useEffect(() => {
    if (typeof timeLimit !== "number" || typeof startedAt !== "number") {
      setRemainingSeconds(null);
      return;
    }

    setRemainingSeconds(getRemainingSeconds(timeLimit, startedAt));

    const interval = setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(timeLimit, startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingSeconds, startedAt, timeLimit]);

  const formattedRemainingTime =
    typeof remainingSeconds === "number"
      ? `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`
      : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={themedStyles.container}>
        <ScrollView contentContainerStyle={themedStyles.content}>
          {!!title && (
            <Text style={[themedStyles.heading, BaseStyles.mb16]}>{title}</Text>
          )}

          {(typeof maxPoints === "number" || typeof timeLimit === "number") && (
            <Text
              style={[BaseStyles.mb16, { color: theme.text, opacity: 0.75 }]}
            >
              {typeof maxPoints === "number"
                ? `${t("maxPointsLabel")}: ${maxPoints}`
                : ""}
              {typeof maxPoints === "number" &&
              typeof formattedRemainingTime === "string"
                ? " • "
                : ""}
              {formattedRemainingTime
                ? `${t("timeLeftLabel", "Time left")}: ${formattedRemainingTime}`
                : ""}
            </Text>
          )}

          {remainingSeconds === 0 && (
            <Text
              style={[BaseStyles.mb16, { color: theme.text, opacity: 0.75 }]}
            >
              {t("timeUpMessage", "Be faster next time")}
            </Text>
          )}

          <Quiz
            questions={questions}
            isLoading={isLoading}
            onAnswer={onAnswer}
            onComplete={onComplete}
          />

          <Pressable
            style={themedStyles.closeButton}
            onPress={onClose}
            accessibilityLabel={t("closeQuizModal")}
          >
            <MaterialIcons name="close" size={24} color={theme.text} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
