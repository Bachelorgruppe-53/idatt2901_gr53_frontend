import axios from "axios";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../constants/Colors";
import { useThemeColor } from "../hooks/useThemeColor";
import { useThemedStyles } from "../hooks/useStyleSheet";
import { BaseStyles } from "../constants/Styles";

/**
 * This component renders a modal that allows users to join a class by entering a class code.
 * It includes input validation and error handling.
 *
 * @returns JSX.Element
 */

interface JoinClassModalProps {
  onClose: () => void;
}

export const JoinClassModal = ({ onClose }: JoinClassModalProps) => {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");

  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  const validateAndSubmit = () => {
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
    axios
      .post("https://localhost:8080/class/join", { code: classCode })
      // TODO: send info om bruker også
      .then((response) => {
        // Handle success (e.g., show success message, update UI)
        alert("Du har blitt med i klassen!");
        onClose();
      })
      .catch((error) => {
        // Handle error (e.g., show error message)
        setError("Feil ved tilkobling til serveren. Vennligst prøv igjen.");
      });
    onClose();
  };

  return (
    <View style={themedStyles.modalBackdrop}>
      <View style={BaseStyles.center}>
        <View style={[themedStyles.modalCard, BaseStyles.gap8]}>
          <Text style={themedStyles.modalTitle}>Bli med i en klasse</Text>
          <Text style={themedStyles.text}>Skriv inn klassekoden din her:</Text>
          <TextInput
            style={themedStyles.input}
            placeholder="Klassekode"
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
            <Text style={themedStyles.buttonText}>Bli med</Text>
          </Pressable>
          <Pressable
            style={[themedStyles.smallButton, { backgroundColor: Colors.brand.red }]}
            onPress={onClose}
          >
            <Text style={themedStyles.buttonText}>Lukk</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};