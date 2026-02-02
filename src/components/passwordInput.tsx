import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Pressable, TextInput } from "react-native-gesture-handler";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
}

const PasswordInput = ({
  value,
  onChangeText,
  placeholder = "Enter password",
  testID,
}: PasswordInputProps) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const theme = useThemeColor();

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View
      style={[
        styles.inputContainer,
        { borderColor: theme.text, backgroundColor: theme.background },
      ]}
    >
      <TextInput
        style={[styles.input, { color: theme.text }]}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        textContentType="password"
        testID={testID}
        accessibilityLabel="Password input field"
      />
      <Pressable
        onPress={togglePasswordVisibility}
        style={styles.iconButton}
        testID={testID ? `${testID}-toggle` : undefined}
      >
        <MaterialIcons
          name={secureTextEntry ? "visibility-off" : "visibility"}
          size={24}
          color={theme.text}
          accessibilityLabel={
            secureTextEntry ? "Show password" : "Hide password"
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
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  iconButton: {
    padding: 8,
  },
});
