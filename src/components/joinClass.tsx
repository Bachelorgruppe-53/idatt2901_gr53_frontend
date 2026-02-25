import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import axios, { isAxiosError } from "axios";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../constants/Colors";
import { useThemeColor } from "../hooks/useThemeColor";

/**
 * This component renders a modal that allows users to join a class by entering a class code.
 * It includes input validation and error handling.
 *
 * @returns JSX.Element
 */

interface JoinClassModalProps {
  onClose: () => void;
}

const JoinClassModal = ({ onClose }: JoinClassModalProps) => {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");
  const theme = useThemeColor();

  const validateAndSubmit = async () => {
    // Clear previous error
    setError("");

    // Validation: Check if empty
    if (!classCode.trim()) {
      setError("Klassekode kan ikke være tom");
      return;
    }

    // Validation: Check length (example: must be 6 characters)
    if (classCode.length !== 6) {
      setError("Klassekode må være 6 tegn");
      return;
    }

    // Validation: Check if alphanumeric only
    if (!/^[a-zA-Z0-9]+$/.test(classCode)) {
      setError("Klassekode kan bare inneholde bokstaver og tall");
      return;
    }

    // If all validations pass

    console.log("Submitting class code:", classCode);
    try {
      const userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const response = await axios.post(
        `${baseUrl}/user/join`,
        { code: classCode },
        { headers: { "X-User-ID": userId } },
      );

      console.log("Successfully joined class:", response.data);
      alert("Du har blitt med i klassen!");
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
        setError(
          backendMessage ||
            "Feil ved tilkobling til serveren. Vennligst prøv igjen.",
        );
        return;
      }

      console.error("Join class failed:", error);
      setError("Feil ved tilkobling til serveren. Vennligst prøv igjen.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Bli med i en klasse</Text>
          <Text style={styles.subText}>Skriv inn klassekoden din her:</Text>
          <TextInput
            style={styles.input}
            placeholder="Klassekode"
            value={classCode}
            onChangeText={(text) => {
              setClassCode(text);
              setError(""); // Clear error when user types
            }}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={validateAndSubmit}
          >
            <Text style={styles.buttonText}>Bli med</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { backgroundColor: Colors.brand.red }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Lukk</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    height: "100%",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: 200,
    borderRadius: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    width: 150,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default JoinClassModal;
