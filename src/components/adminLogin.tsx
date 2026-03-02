import { loginAdmin } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    GestureHandlerRootView,
    Pressable,
    TextInput,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useThemeColor } from "../hooks/useThemeColor";
import PasswordInput from "./passwordInput";
import { useThemedStyles } from "../hooks/useStyleSheet";
import { BaseStyles } from "../constants/Styles";
import { ThemeContext } from "@react-navigation/native";

/**
 * Component for admin login screen.
 *
 * @returns TSX Element
 */

const AdminLogin = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { setAuthenticated } = useAuth();

  const router = useRouter();
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  let errorMessage: string | null = null;

  const handleLogin = async (username: string, password: string) => {
    try {
      await loginAdmin(username, password);
      setAuthenticated(true);
      router.replace("/settings/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Login failed. Please check your credentials.");
    }
  };

  const setErrorMessage = (message: string) => {
    errorMessage = message;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={BaseStyles.flex}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={themedStyles.containerAlign}
          >
            <Text style={themedStyles.boldText}>Username</Text>
            <TextInput
              style={themedStyles.input}
              onChangeText={setUsername}
              value={username}
              placeholder="Enter username"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
            />

            <Text style={themedStyles.boldText}>Password</Text>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              testID="password-input"
            />

            <Pressable
              onPress={() => {
                handleLogin(username, password);
              }}
              style={[themedStyles.button, { width: "100%" }]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons
                  name="login"
                  size={24}
                  color={theme.buttontext}
                />
                <Text style={themedStyles.buttonText}>
                  {" "}
                  Logg inn
                </Text>
              </View>
            </Pressable>
            <View>
              {errorMessage && (
                <Text style={themedStyles.errorText}>{errorMessage}</Text>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default AdminLogin;

