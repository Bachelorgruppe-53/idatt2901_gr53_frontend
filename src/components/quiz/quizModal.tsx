import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import Quiz, { type QuizItem } from "./quiz";

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
  onAnswer: (questionId: number, chosenOptionIds: number[]) => void;
  onComplete?: () => void;
  onClose: () => void;
}

export default function QuizModal({
  visible,
  title,
  questions,
  isLoading = false,
  onAnswer,
  onComplete,
  onClose,
}: QuizModalProps) {
  const themedStyles = useThemedStyles();
  const theme = useThemeColor();

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

          <Quiz
            questions={questions}
            isLoading={isLoading}
            onAnswer={onAnswer}
            onComplete={onComplete}
          />

          <Pressable style={themedStyles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.text} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}