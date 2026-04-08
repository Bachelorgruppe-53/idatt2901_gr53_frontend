import type { QuizItem } from "@/src/components/quiz/quiz";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Quiz from "./quiz";

/**
 * QuizModal component that displays a modal with a quiz. It accepts props for visibility, title, quiz questions, loading state, answer handling, completion handling, and closing the modal.
 *
 * @param {QuizModalProps} props - The props for the QuizModal component.
 * @returns {JSX.Element} The rendered QuizModal component.
 */

interface QuizModalProps {
  visible: boolean;
  title?: string;
  questions?: QuizItem[];
  isLoading?: boolean;
  maxPoints?: number | null;
  timeLimit?: number | null;
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
  onAnswer,
  onComplete,
  onClose,
}: QuizModalProps) {
  const themedStyles = useThemedStyles();
  const theme = useThemeColor();
  const { t } = useTranslation("quiz");

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
              {typeof maxPoints === "number" && typeof timeLimit === "number"
                ? " • "
                : ""}
              {typeof timeLimit === "number"
                ? `${t("timeLimitLabel")}: ${timeLimit} ${t("secondsUnit")}`
                : ""}
            </Text>
          )}

          <Quiz
            questions={questions}
            isLoading={isLoading}
            onAnswer={onAnswer}
            onComplete={onComplete}
          />

          <Pressable style={themedStyles.closeButton} 
            onPress={onClose}
            accessibilityLabel={t("closeQuizModal")}>
            <MaterialIcons name="close" size={24} color={theme.text} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
