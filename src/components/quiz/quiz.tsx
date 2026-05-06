import type { QuizQuestionType } from "@/services/types/quiz";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * The core Quiz engine responsible for question progression and user interaction.
 * * Features:
 * - **State Management**: Tracks current question index and resets automatically when the `questions` array changes.
 * - **UX Design**: Renders a visual progress bar (dots) and a counter pill for user orientation.
 * - **Dynamic Options**: Maps alphabet labels (A, B, C...) to answer choices for better readability.
 * - **A11y Support**: Fully localized accessibility labels and hints for screen readers, including position context.
 * 
 * @param questions - Array of QuizItem objects containing IDs, strings, and multiple-choice options.
 * @param onAnswer - Callback for when a user selects an option (notifies parent of selection).
 * @param onComplete - Triggered automatically once the user answers the final question.
 * @param isLoading - State-driven flag to show/hide the loading view.
 */

export type QuizItem = {
  questionId: number;
  question: string;
  type: QuizQuestionType;
  options: {
    id: number;
    text: string;
  }[];
};

export type QuizProps = {
  questions?: QuizItem[];
  onAnswer: (questionId: number, chosenOptionIds: number[]) => void;
  onComplete?: () => void;
  isLoading?: boolean;
};

/**
 * Quiz component that renders a series of questions with multiple-choice options, tracks user progress, and handles user interactions. 
 * It supports loading states and accessibility features for screen readers.
 * @param param0 - An object containing the quiz questions, answer callback, completion callback, and loading state.
 * @returns JSX.Element
 */
export default function Quiz({
  questions = [],
  onAnswer,
  onComplete,
  isLoading = false,
}: QuizProps) {
  const theme = useThemeColor();
  const { t } = useTranslation("quiz");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Resets question index to 0 whenever a new set of questions is loaded
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [questions]);

  // Early return for loading state to avoid rendering empty question views
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.loadingText, { color: theme.placeholder }]}>
          {t("loadingText")}
        </Text>
      </View>
    );
  }

  // Handle cases where the quiz might be empty to prevent "undefined" errors on currentQuestion
  if (!questions.length) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.loadingText, { color: theme.placeholder }]}>
          {t("noQuestionsText")}
        </Text>
      </View>
    );
  }

  const current = questions[currentQuestionIndex];
  const optionLabels = ["A", "B", "C", "D", "E", "F"];
  
  const handleSelect = (optionId: number) => {
    // Notify parent component of the selection
    onAnswer(current.questionId, [optionId]);

    const next = currentQuestionIndex + 1;
    // Check if there are more questions or if the quiz is finished
    if (next < questions.length) {
      setCurrentQuestionIndex(next);
    } else {
      onComplete?.();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.progressPill,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.progressText, { color: theme.placeholder }]}>
            {t("questionCounterText")} {currentQuestionIndex + 1} {t("ofText")}{" "}
            {questions.length}
          </Text>
        </View>
      </View>

      {/* Visual Progress Indicator (Dots) */}
      <View style={styles.progressDots}>
        {questions.map((_: QuizItem, idx: number) => (
          <View
            key={idx}
            style={[
              styles.progressDot,
              {
                borderColor: theme.border,
                backgroundColor:
                  idx <= currentQuestionIndex
                    ? theme.text
                    : theme.backgroundSecondary,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.questionArea}>
        <Text
          numberOfLines={3}
          ellipsizeMode="tail"
          style={[styles.questionText, { color: theme.text }]}
        >
          {current.question}
        </Text>
      </View>

      {/* Answer Options Map */}
      {current.options.map((opt: QuizItem["options"][number], idx: number) => (
        <Pressable
          key={opt.id}
          onPress={() => handleSelect(opt.id)}
          accessibilityRole="button"
          accessibilityLabel={t("answerOptionAccessibilityLabel", {
            marker: optionLabels[idx] ?? `${idx + 1}`,
            text: opt.text,
            position: idx + 1,
            total: current.options.length,
          })}
          accessibilityHint={t("answerOptionAccessibilityHint")}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              opacity: pressed ? 0.8 : 1,
            },
            pressed && styles.optionPressed,
          ]}
        >
          <View style={styles.optionContent}>
            {/* The A, B, C Marker */}
            <View
              style={[
                styles.optionLabel,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
            >
              <Text style={[styles.optionLabelText, { color: theme.text }]}>
                {optionLabels[idx] ?? `${idx + 1}`}
              </Text>
            </View>
            <Text style={[styles.optionText, { color: theme.text }]}>
              {opt.text}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
    maxWidth: "100%",
    minWidth: "100%",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tapHint: {
    fontSize: 12,
    fontWeight: "500",
  },
  questionText: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
  },
  questionArea: {
    minHeight: 60,
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  optionPressed: {
    transform: [{ scale: 0.99 }],
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionLabel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabelText: {
    fontSize: 12,
    fontWeight: "700",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap",
  },
  loadingText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
});
