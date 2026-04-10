import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import axios, { isAxiosError } from "axios";
import { useRef, useState } from "react";
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

export const JoinClassModal = ({ onClose, onJoined }: JoinClassModalProps) => {
  // We use a regular space as a placeholder to ensure backspace always triggers events
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
    } else {}
  };

  const validateAndSubmit = async () => {
    // Join and trim to remove the placeholder spaces
    const codeToSubmit = codeDigits.join("").trim();
    setError("");

    if (!codeToSubmit || codeToSubmit.length !== CODE_LENGTH) {
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
        // Assume getReadableJoinError is defined or handle simply:
        setError(error.response?.data?.message || t("serverError"));
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
      <View style={[themedStyles.modalBackdrop, { backgroundColor: "transparent" }]}>
        <View style={[BaseStyles.center, BaseStyles.w80]}>
          <View style={[themedStyles.modalCard, BaseStyles.gap8]}>
            <Text style={themedStyles.modalTitle}>{t("joinClass")}</Text>
            <Text style={themedStyles.text}>{t("enterClassCode")}</Text>
            
            <View style={[BaseStyles.rowCenter, { gap: 8}]}>
              {codeDigits.map((digit, index) => (
                <TextInput
                  key={`code-${index}`}
                  ref={(ref: TextInput | null) => {
                    inputRefs.current[index] = ref;
                  }}
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
                      fontSize:20,
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
                  keyboardType={Platform.OS === 'android' ? 'visible-password' : 'ascii-capable'}
                  textContentType="oneTimeCode"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={2} 
                  caretHidden={false}
                  selectionColor={Colors.brand.darkBlue}
                  // Keep cursor at the end
                  selection={{ start: digit.length, end: digit.length }}
                />
              ))}
            </View>

            {error ? <Text style={themedStyles.errorText}>{error}</Text> : null}
            
            <Pressable style={themedStyles.smallButton} onPress={validateAndSubmit}>
              <Text style={themedStyles.buttonText}>{t("join")}</Text>
            </Pressable>
            
            <Pressable
              style={[themedStyles.smallButton, { backgroundColor: Colors.brand.red }]}
              onPress={onClose}
            >
              <Text style={themedStyles.buttonText}>{t("close")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};