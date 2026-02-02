import { loginAdmin } from "@/services/loginService";
import { useThemeColor } from "@/src/hooks/useThemeColor";
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

/**
 * Component for admin login screen.
 *
 * @returns TSX Element
 */

const AdminLogin = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const router = useRouter();

  let errorMessage = "";

  const theme = useThemeColor();

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await loginAdmin(username, password);
      // Handle successful login, e.g., navigate to admin dashboard
      console.log("Login successful:", response);
      router.push("/settings/admin/dashboard");
    } catch (error) {
      // Handle login error, e.g., show error message
      console.error("Login failed:", error);
      // Set error message state here
      setErrorMessage("Login failed. Please check your credentials.");
    }
  };

  const setErrorMessage = (message: string) => {
    errorMessage = message;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[styles.container, { backgroundColor: theme.background }]}
          >
            <Text style={[styles.label, { color: theme.text }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.text },
              ]}
              onChangeText={setUsername}
              value={username}
              placeholder="Enter username"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.text },
              ]}
              onChangeText={setPassword}
              value={password}
              placeholder="Enter password"
              secureTextEntry
              autoCapitalize="none"
            />

            <Pressable
              onPress={() => {
                handleLogin(username, password);
              }}
              style={{
                backgroundColor: theme.button,
                padding: 10,
                borderRadius: 8,
              }}
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
                <Text style={[styles.buttonText, { color: theme.buttontext }]}>
                  {" "}
                  Logg inn
                </Text>
              </View>
            </Pressable>
            <View>
              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default AdminLogin;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
