import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type QuizItem = {
  question: string;
  options: string[];
  correctIndex?: number;
};

type QuizProps = {
  questions?: QuizItem[];
  onAnswer: (questionIndex: number, selectedIndex: number) => void;
  onComplete?: () => void;
  isLoading?: boolean;
};

const defaultQuestions: QuizItem[] = [
  {
    question: "Hva gjør en sykepleier?",
    options: ["Tar vare på pasienter", "Lager mat", "Kjører ambulanse"],
    correctIndex: 0,
  },
  {
    question: "Hvilken utdanning trenger man for å bli sykepleier?",
    options: ["Bachelorgrad", "Mastergrad", "Doktorgrad"],
    correctIndex: 0,
  },
  {
    question: "Hvor mange sykepleiere jobber på St. Olavs hospital?",
    options: ["500", "1000", "1500"],
    correctIndex: 1,
  },
];

export default function Quiz({
  questions,
  onAnswer,
  onComplete,
  isLoading = false,
}: QuizProps) {
  const theme = useThemeColor();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const items =
    questions && questions.length > 0 ? questions : defaultQuestions;

  if (!items || items.length === 0) return null;

  const current = items[currentQuestionIndex];
  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  const handleSelect = (index: number) => {
    if (isLoading) return;

    setSelectedIndex(index);
    onAnswer(currentQuestionIndex, index);

    const next = currentQuestionIndex + 1;
    if (next < items.length) {
      setCurrentQuestionIndex(next);
      setSelectedIndex(null);
    } else {
      onComplete && onComplete();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
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
            Spørsmal {currentQuestionIndex + 1} av {items.length}
          </Text>
        </View>
        <Text style={[styles.tapHint, { color: theme.placeholder }]}>
          Trykk for å svare
        </Text>
      </View>

      <View style={styles.progressDots}>
        {items.map((_, idx) => (
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

      {current.options.map((opt, idx) => (
        <Pressable
          key={idx}
          onPress={() => handleSelect(idx)}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              opacity: pressed || isLoading ? 0.8 : 1,
            },
            selectedIndex === idx && {
              backgroundColor: theme.background,
              borderColor: theme.text,
              borderWidth: 2,
            },
            pressed && styles.optionPressed,
          ]}
        >
          <View style={styles.optionContent}>
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
              {opt}
            </Text>
          </View>
        </Pressable>
      ))}

      {isLoading ? (
        <Text style={[styles.loadingText, { color: theme.placeholder }]}>
          Laster...
        </Text>
      ) : null}
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
