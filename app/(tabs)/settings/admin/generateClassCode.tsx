import { getApiBaseUrl } from "@/services/apiConfig";
import { getToken } from "@/services/utils/secureStorage";
import { Colors } from "@/src/constants/Colors";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios, { isAxiosError } from "axios";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";

/**
 * Generate Class Code screen component.
 *
 * @returns JSX.Element
 */

export default function GenerateClassCode() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleCopy = async () => {
    await Clipboard.setStringAsync(generatedCode);
    Alert.alert("Kopiert", "Klassekoden er kopiert til utklippstavlen");
  };

  const handleGenerateClassCode = async () => {
    if (!className.trim() || !schoolName.trim()) {
      Alert.alert("Feil", "Vennligst fyll ut både klassenavn og skole.");
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");

      console.log("Using token:", token); // debug log
      console.log(
        "Token preview:",
        token ? token.substring(0, 20) + "..." : "No token",
      ); // Debug log

      if (!token) {
        Alert.alert(
          "Feil",
          "Ugyldig eller manglende autentisering. Vennligst logg inn på nytt.",
        );
        router.replace("./adminLogin");
        return;
      }

      console.log("Sending request to:", `${baseUrl}/admin/code`); // Debug log
      console.log("Request body:", {
        className: className.trim(),
        schoolName: schoolName.trim(),
      }); // Debug log

      const response = await axios.post(
        `${baseUrl}/admin/code`,
        {
          className: className.trim(),
          schoolName: schoolName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const classCode =
        typeof response.data === "string"
          ? response.data
          : (response.data?.code ?? "");

      if (!classCode) {
        Alert.alert("Feil", "Fikk ingen klassekode fra serveren.");
        return;
      }

      console.log("Success! Class code:", classCode); // Debug log

      setGeneratedCode(classCode);
      setShowCodeModal(true);
    } catch (error) {
      console.error("Full error:", error); // Debug log

      if (isAxiosError(error)) {
        console.log("Response status:", error.response?.status); // Debug log
        console.log("Response data:", error.response?.data); // Debug log
        console.log("Response headers:", error.response?.headers); // Debug log

        const status = error.response?.status;

        if (status === 401) {
          Alert.alert(
            "Autentiseringsfeil",
            "Din sesjon har utløpt. Vennligst logg inn på nytt.",
            [{ text: "OK", onPress: () => router.replace("./adminLogin") }],
          );
        } else if (status === 403) {
          Alert.alert(
            "Tilgangsfeil",
            `Du har ikke tilgang til denne funksjonen.\n\nDetaljer: ${error.response?.data?.message || "Ingen tilleggsinfo"}`,
          );
        } else if (status === 500) {
          Alert.alert(
            "Serverfeil",
            "En feil oppstod på serveren. Kontakt systemadministrator.",
          );
        } else {
          Alert.alert("Feil", `Noe gikk galt (${status}). Prøv igjen senere.`);
        }
      } else {
        Alert.alert(
          "Feil",
          "Kunne ikke koble til serveren. Sjekk nettverkstilkoblingen.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Modal for displaying generated class code, copying to clipboard, etc.

  return (
    <View style={themedStyles.container}>
      <View style={[BaseStyles.rowCenter, BaseStyles.gap8, BaseStyles.m16]}>
        <MaterialCommunityIcons
          name="shield-account"
          size={50}
          color={theme.text}
        />
        <Text style={themedStyles.heading}>Generer Klassekode</Text>
      </View>

      <View style={[BaseStyles.w80, BaseStyles.mb16]}>
        <Text style={themedStyles.boldText}>Klassenavn:</Text>
        <TextInput
          style={themedStyles.input}
          placeholder="Skriv inn klassenavn her"
          placeholderTextColor={theme.placeholder}
          value={className}
          onChangeText={setClassName}
        />
      </View>

      <View style={[BaseStyles.w80, BaseStyles.mb16]}>
        <Text style={themedStyles.boldText}>Skole:</Text>
        <TextInput
          style={themedStyles.input}
          placeholder="Skriv inn skole her"
          placeholderTextColor={theme.placeholder}
          value={schoolName}
          onChangeText={setSchoolName}
        />
      </View>

      <Pressable
        style={[themedStyles.button, { backgroundColor: Colors.brand.green }]}
        onPress={handleGenerateClassCode}
        disabled={isLoading}
      >
        <Text style={themedStyles.buttonText}>
          {isLoading ? "Genererer..." : "Generer Klassekode"}
        </Text>
      </Pressable>

      <Modal transparent visible={showCodeModal} animationType="fade">
        <View style={themedStyles.modalBackdrop}>
          <View
            style={[
              themedStyles.modalCard,
              { backgroundColor: theme.background },
            ]}
          >
            <Text style={[themedStyles.text, BaseStyles.my8]}>Klassekode:</Text>
            <Text style={[themedStyles.heading, BaseStyles.mb16]}>
              {generatedCode}
            </Text>
            <View
              style={[
                BaseStyles.rowCenter,
                { justifyContent: "space-between" },
              ]}
            >
              <Pressable
                style={[themedStyles.smallButton]}
                onPress={handleCopy}
              >
                <Text style={themedStyles.buttonText}>Kopier</Text>
              </Pressable>
              <Pressable
                style={[
                  themedStyles.smallButton,
                  { backgroundColor: Colors.brand.red },
                ]}
                onPress={() => setShowCodeModal(false)}
              >
                <Text
                  style={[
                    themedStyles.buttonText,
                    { color: Colors.brand.white },
                  ]}
                >
                  Lukk
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
