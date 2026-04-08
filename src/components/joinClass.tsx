import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import axios, { isAxiosError } from "axios";
import { useState } from "react";
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

/**
 * This component renders a modal that allows users to join a class by entering a class code.
 * It includes input validation and error handling.
 *
 * @returns JSX.Element
 */

interface JoinClassModalProps {
  onClose: () => void;
  onJoined?: () => void;
}

export const JoinClassModal = ({ onClose, onJoined }: JoinClassModalProps) => {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");

  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  const { t } = useTranslation("class");

  const validateAndSubmit = async () => {
    // Clear previous error
    setError("");

    // Validation: Check if empty
    if (!classCode.trim()) {
      setError(t("classCodeEmpty"));
      return;
    }

    // Validation: Check length (example: must be 6 characters)
    if (classCode.length !== 6) {
      setError(t("sixCharacterError"));
      return;
    }

    // Validation: Check if alphanumeric only
    if (!/^[a-zA-Z0-9]+$/.test(classCode)) {
      setError(t("invalidCharacterError"));
      return;
    }

    // If all validations pass

    console.log("Submitting class code:", classCode);
    try {
      const userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const response = await axios.put(
        `${baseUrl}/user/join`,
        { code: classCode },
        { headers: { "X-User-ID": userId } },
      );

      console.log("Successfully joined class:", response.data);
      alert(t("joinedClassSuccess"));
      onJoined?.();
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        const backendMessage =
          typeof error.response?.data === "string"
            ? error.response.data
            : error.response?.data && typeof error.response.data === "object"
              ? JSON.stringify(error.response.data)
              : error.message;

        console.error("Join class failed:", backendMessage);
        setError(backendMessage || t("serverError"));
        return;
      }

      console.error("Join class failed:", error);
      setError(t("serverError"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "rgba(48, 48, 48, 0.5)" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={[themedStyles.modalBackdrop, {backgroundColor: "transparent"}]}>
        <View style={[BaseStyles.center, BaseStyles.w80]}>
          <View style={[themedStyles.modalCard, BaseStyles.gap8]}>
            <Text style={themedStyles.modalTitle}>{t("joinClass")}</Text>
            <Text style={themedStyles.text}>{t("enterClassCode")}</Text>
            <TextInput
              style={themedStyles.input}
              placeholder={t("classCode")}
              accessibilityLabel={t("enterClassCode")}
              placeholderTextColor={theme.placeholder}
              value={classCode}
              onChangeText={(text) => {
                setClassCode(text);
                setError(""); // Clear error when user types
              }}
            />
            {error ? <Text style={themedStyles.errorText}>{error}</Text> : null}
            <Pressable
              style={themedStyles.smallButton}
              onPress={validateAndSubmit}
            >
              <Text style={themedStyles.buttonText}>{t("join")}</Text>
            </Pressable>
            <Pressable
              style={[
                themedStyles.smallButton,
                { backgroundColor: Colors.brand.red },
              ]}
              onPress={onClose}
              accessibilityLabel={t("close")}
            >
              <Text style={themedStyles.buttonText}>{t("close")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
