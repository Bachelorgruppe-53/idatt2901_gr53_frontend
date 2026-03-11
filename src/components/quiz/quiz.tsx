import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type QuizOptionItem = {
  id: number;
  text: string;
};

export type QuizItem = {
  questionId: number;
  question: string;
  options: QuizOptionItem[];
};

export type QuizProps = {
  questions?: QuizItem[];
  onAnswer: (questionId: number, chosenOptionIds: number[]) => void;
  onComplete?: () => void;
  isLoading?: boolean;
};

export default function Quiz({
  questions = [],
  onAnswer,
  onComplete,
  isLoading = false,
}: QuizProps) {
  const theme = useThemeColor();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [questions]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <Text style={[styles.loadingText, { color: theme.placeholder }]}>Laster quiz...</Text>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <Text style={[styles.loadingText, { color: theme.placeholder }]}>Ingen spørsmål tilgjengelig.</Text>
      </View>
    );
  }

  const current = questions[currentQuestionIndex];
  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  const handleSelect = (optionId: number) => {
    onAnswer(current.questionId, [optionId]);

    const next = currentQuestionIndex + 1;
    if (next < questions.length) {
      setCurrentQuestionIndex(next);
    } else {
      onComplete?.();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <View style={[styles.progressPill, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <Text style={[styles.progressText, { color: theme.placeholder }]}>
            Spørsmål {currentQuestionIndex + 1} av {questions.length}
          </Text>
        </View>
      </View>

      <View style={styles.progressDots}>
        {questions.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressDot,
              {
                borderColor: theme.border,
                backgroundColor: idx <= currentQuestionIndex ? theme.text : theme.backgroundSecondary,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.questionArea}>
        <Text numberOfLines={3} ellipsizeMode="tail" style={[styles.questionText, { color: theme.text }]}>
          {current.question}
        </Text>
      </View>

      {current.options.map((opt, idx) => (
        <Pressable
          key={opt.id}
          onPress={() => handleSelect(opt.id)}
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
            <View style={[styles.optionLabel, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <Text style={[styles.optionLabelText, { color: theme.text }]}>
                {optionLabels[idx] ?? `${idx + 1}`}
              </Text>
            </View>
            <Text style={[styles.optionText, { color: theme.text }]}>{opt.text}</Text>
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
    height: 76,
    justifyContent: "flex-start",
    marginBottom: 10,
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
  },
  loadingText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
});
