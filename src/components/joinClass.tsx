import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import axios, { isAxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { BaseStyles } from "../constants/Styles";
import { useThemedStyles } from "../hooks/useStyleSheet";
import { useThemeColor } from "../hooks/useThemeColor";

interface JoinClassModalProps {
  onClose: () => void;
  onJoined?: () => void;
}

const CODE_LENGTH = 6;

const getJoinErrorMessage = (data: unknown): string | null => {
  if (typeof data === "string") {
    const trimmed = data.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    const directMessageKeys = ["message", "error", "detail", "title"];
    for (const key of directMessageKeys) {
      const value = record[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }

    const errors = record.errors;
    if (Array.isArray(errors)) {
      const firstTextError = errors.find(
        (item) => typeof item === "string" && item.trim().length > 0,
      );
      if (typeof firstTextError === "string") {
        return firstTextError;
      }
    }
  }

  return null;
};

export const JoinClassModal = ({ onClose, onJoined }: JoinClassModalProps) => {
  const [codeDigits, setCodeDigits] = useState<string[]>(
    Array(CODE_LENGTH).fill(" "),
  );
  const [error, setError] = useState("");
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  const { t } = useTranslation("class");

  const setFocusAt = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleBackspace = (index: number) => {
    const nextDigits = [...codeDigits];

    // If the current cell has a real character, reset it to space
    if (codeDigits[index] !== " ") {
      nextDigits[index] = " ";
      setCodeDigits(nextDigits);
    }
    // If it's already a space, jump back and clear the previous cell
    else if (index > 0) {
      nextDigits[index - 1] = " ";
      setCodeDigits(nextDigits);
      setFocusAt(index - 1);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    setError("");

    // Detection for backspace: text becomes empty
    if (text.length === 0) {
      handleBackspace(index);
      return;
    }

    // Strip the placeholder space to see what was typed
    const char = text.replace(" ", "").toUpperCase();
    if (char.length === 0) return;

    const nextDigits = [...codeDigits];
    let cursor = index;

    // Support for single typing or multi-character paste
    for (const singleChar of char) {
      if (cursor >= CODE_LENGTH) break;
      if (/^[a-zA-Z0-9]$/.test(singleChar)) {
        nextDigits[cursor] = singleChar;
        cursor += 1;
      }
    }

    setCodeDigits(nextDigits);

    if (cursor < CODE_LENGTH) {
      setFocusAt(cursor);
    }
  };

  const validateAndSubmit = async () => {
    const hasCompleteCode = codeDigits.every((digit) =>
      /^[A-Z0-9]$/.test(digit),
    );
    const codeToSubmit = codeDigits.join("");
    setError("");

    if (!hasCompleteCode || codeToSubmit.length !== CODE_LENGTH) {
      setError(t("sixCharacterError"));
      return;
    }

    try {
      const userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      await axios.put(
        `${baseUrl}/user/join`,
        { code: codeToSubmit },
        { headers: { "X-User-ID": userId } },
      );

      onJoined?.();
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        const backendMessage = getJoinErrorMessage(error.response?.data);
        setError(backendMessage ?? t("serverError"));
      } else {
        setError(t("serverError"));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[themedStyles.modalBackdrop, { backgroundColor: "transparent" }]}
      >
        <View style={[BaseStyles.center, BaseStyles.w80]}>
          <View style={[themedStyles.modalCard, BaseStyles.gap8]}>
            <Text style={themedStyles.modalTitle}>{t("joinClass")}</Text>
            <Text style={themedStyles.text}>{t("enterClassCode")}</Text>

            <View style={[BaseStyles.rowCenter, { gap: 8 }]}>
              {codeDigits.map((digit, index) => (
                <TextInput
                  key={`code-${index}`}
                  ref={(ref: TextInput | null) => {
                    inputRefs.current[index] = ref;
                  }}
                  autoFocus={index === 0}
                  accessibilityLabel={`Class code character ${index + 1} of ${CODE_LENGTH}`}
                  accessibilityHint="Enter one character of the 6-character class code"
                  accessibilityRole="text"
                  style={[
                    themedStyles.input,
                    {
                      width: 30,
                      height: 52,
                      textAlign: "center",
                      includeFontPadding: false,
                      padding: 0,
                      paddingVertical: 0,
                      paddingHorizontal: 0,
                      textAlignVertical: "center",
                      fontSize: 20,
                      fontWeight: "bold",
                      // Hide placeholder space by making it transparent
                      color: digit === " " ? "transparent" : theme.text,
                    },
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={({ nativeEvent }) => {
                    // Critical for iOS and some Android keyboards
                    if (nativeEvent.key === "Backspace") {
                      handleBackspace(index);
                    }
                  }}
                  // visible-password disables predictive text on Android (backspace fix)
                  keyboardType={
                    Platform.OS === "android"
                      ? "visible-password"
                      : "ascii-capable"
                  }
                  textContentType="oneTimeCode"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={CODE_LENGTH + 1} // Allow pasting full code
                  caretHidden={false}
                  selectionColor={Colors.brand.darkBlue}
                  // Keep cursor at the end
                  selection={{ start: digit.length, end: digit.length }}
                />
              ))}
            </View>

            {error ? <Text style={themedStyles.errorText}>{error}</Text> : null}

            <Pressable
              style={themedStyles.smallButton}
              onPress={validateAndSubmit}
              accessibilityRole="button"
              accessibilityLabel={t("joinClass")}
              accessibilityHint="Validates and submits the class code"
            >
              <Text style={themedStyles.buttonText}>{t("join")}</Text>
            </Pressable>

            <Pressable
              style={[
                themedStyles.smallButton,
                { backgroundColor: theme.errorRed },
              ]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t("close")}
              accessibilityHint="Closes the join class dialog"
            >
              <Text style={themedStyles.buttonText}>{t("close")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
