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
 * A full-screen modal wrapper for the Quiz engine.
 * * Features:
 * - **State Management**: Tracks and formats real-time countdowns based on `startedAt` and `timeLimit`.
 * - **Theming**: Integrates with `useThemedStyles` and `useThemeColor` for dynamic UI updates.
 * - **Localization**: Uses `i18next` for translating labels (points, time, and accessibility).
 * - **Flow Control**: Manages the lifecycle between the active quiz state and the modal's visibility.
 * 
 * @param visible - Controls the visibility of the modal.
 * @param title - Optional header text for the quiz session.
 * @param questions - Array of QuizItem objects to be rendered by the internal Quiz component.
 * @param timeLimit - Total duration allowed for the quiz in seconds.
 * @param startedAt - Unix timestamp (ms) representing when the quiz attempt began.
 * @param onAnswer - Callback triggered when a user selects options for a question.
 * @param onComplete - Optional callback triggered after the final question is answered.
 * @param onClose - Callback to dismiss the modal.
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

  // Calculates time left by comparing current time to the start timestamp
  const getRemainingSeconds = useCallback(
    (limit: number, startTimestamp: number) => {
      const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
      return Math.max(0, limit - elapsedSeconds);
    },
    [],
  );

  useEffect(() => {
    // Disable timer if timeLimit or startedAt is not provided
    if (typeof timeLimit !== "number" || typeof startedAt !== "number") {
      setRemainingSeconds(null);
      return;
    }

    // Initialize remaining seconds immediately on mount
    setRemainingSeconds(getRemainingSeconds(timeLimit, startedAt));

    // Set up interval to update remaining seconds every second, and clear on unmount
    const interval = setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(timeLimit, startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingSeconds, startedAt, timeLimit]);

  // Format remaining seconds into MM:SS format for display
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

          {/* Metadata Row: Displays Max Points and/or Time Remaining if available */}
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

          {/* Feedback message shown only when the countdown reaches zero */}
          {remainingSeconds === 0 && (
            <Text
              style={[BaseStyles.mb16, { color: theme.text, opacity: 0.75 }]}
            >
              {t("timeUpMessage", "Be faster next time")}
            </Text>
          )}

          {/* Core Quiz Engine: Handles question rendering and user input */}
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
