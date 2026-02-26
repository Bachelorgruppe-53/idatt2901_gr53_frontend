import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Pressable, TextInput } from "react-native-gesture-handler";
import { BaseStyles } from "../constants/Styles";
import { useThemedStyles } from "../hooks/useStyleSheet";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
}

const PasswordInput = ({ value, onChangeText, testID }: PasswordInputProps) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  const { t } = useTranslation("auth");
  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View
      style={[
        themedStyles.input,
        { borderColor: theme.text, backgroundColor: theme.background },
      ]}
    >
      <TextInput
        style={[styles.input, { color: theme.text }]}
        onChangeText={onChangeText}
        value={value}
        placeholder={t("enterPassword")}
        placeholderTextColor={theme.placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        textContentType="password"
        testID={testID}
        accessibilityLabel="Password input field"
      />
      <Pressable
        onPress={togglePasswordVisibility}
        style={BaseStyles.p8}
        testID={testID ? `${testID}-toggle` : undefined}
      >
        <MaterialIcons
          name={secureTextEntry ? "visibility-off" : "visibility"}
          size={24}
          color={theme.text}
          accessibilityLabel={
            secureTextEntry ? t("showPassword") : t("hidePassword")
          }
        />
      </Pressable>
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
});
