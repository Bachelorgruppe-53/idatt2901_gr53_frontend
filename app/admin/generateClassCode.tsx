import { Colors } from "@/src/constants/Colors";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { getToken } from "@/services/utils/secureStorage";

/**
 * Generate Class Code screen component.
 * 
 * @returns JSX.Element
 */

export default function GenerateClassCode() {
    const theme = useThemeColor();
    const [className, setClassName] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateClassCode = async () => {
        if (!className.trim() || !schoolName.trim()) {
            Alert.alert("Feil", "Vennligst fyll ut både klassenavn og skole.");
            return;
        }

        setIsLoading(true);

        try {
            const token = await getToken();

            console.log("Using token:", token); // debug log
            console.log("Token preview:", token ? token.substring(0, 20) + "..." : "No token"); // Debug log

            if (!token) {
                Alert.alert("Feil", "Ugyldig eller manglende autentisering. Vennligst logg inn på nytt.");
                setIsLoading(false); //sende rett tilbake til login-skjerm?
                return;
            }

            console.log("Sending request to:", "http://localhost:8080/admin/code"); // Debug log
            console.log("Request body:", { className: className.trim(), schoolName: schoolName.trim() }); // Debug log

            const response = await axios.post("http://localhost:8080/admin/code", 
              {
                  className: className.trim(),
                  schoolName: schoolName.trim(),
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",

                  },
                }
            );
            const classCode = response.data;
            console.log("Success! Class code:", classCode); // Debug log


            Alert.alert(
              "Suksess",
              `Klassekode generert: ${classCode}`,
              [
                { 
                text: "OK",
                onPress: () => router.back() 
                }
              ]
            );

            setClassName("");
            setSchoolName("");

      } catch (error) {
          console.error("Full error:", error); // Debug log
          
          if (axios.isAxiosError(error)) {
              console.log("Response status:", error.response?.status); // Debug log
              console.log("Response data:", error.response?.data); // Debug log
              console.log("Response headers:", error.response?.headers); // Debug log
              
              const status = error.response?.status;
              
              if (status === 401) {
                  Alert.alert(
                      "Autentiseringsfeil",
                      "Din sesjon har utløpt. Vennligst logg inn på nytt.",
                      [{ text: "OK", onPress: () => router.replace("./adminLogin") }]
                  );
              } else if (status === 403) {
                  Alert.alert(
                      "Tilgangsfeil", 
                      `Du har ikke tilgang til denne funksjonen.\n\nDetaljer: ${error.response?.data?.message || 'Ingen tilleggsinfo'}`
                  );
              } else if (status === 500) {
                  Alert.alert(
                      "Serverfeil",
                      "En feil oppstod på serveren. Kontakt systemadministrator."
                  );
              } else {
                  Alert.alert(
                      "Feil", 
                      `Noe gikk galt (${status}). Prøv igjen senere.`
                  );
              }
          } else {
              Alert.alert(
                  "Feil", 
                  "Kunne ikke koble til serveren. Sjekk nettverkstilkoblingen."
              );
          }
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Pressable style={styles.backButton}
            onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={30} color={theme.text} />
        </Pressable>
        <View style={styles.header}>
            <MaterialCommunityIcons name="shield-account" size={50} color={theme.text} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>Generer Klassekode</Text>
        </View>

        <View style={styles.inputContainer}>
            <Text style={{ color: theme.text }}>Klassenavn:</Text>
            <TextInput 
              style={[styles.input, { color: theme.text }]}
              placeholder="Skriv inn klassenavn her" 
              placeholderTextColor={theme.placeholder}
              value={className} onChangeText={setClassName}/>
        </View>

        <View style={styles.inputContainer}>
            <Text style={{ color: theme.text }}>Skole:</Text>
            <TextInput 
              style={[styles.input, { color: theme.text },]} 
              placeholder="Skriv inn skole her" 
              placeholderTextColor={theme.placeholder}
              value={schoolName} onChangeText={setSchoolName}/>
        </View>

        <Pressable style={[ styles.button, { backgroundColor: Colors.brand.green }]}
            onPress={handleGenerateClassCode}
            disabled={isLoading}
        >
            <Text style={{ color: theme.text }}>{isLoading ? "Genererer..." : "Generer Klassekode"}</Text>
        </Pressable>  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    borderRadius: 5,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 8,
    width: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: Colors.brand.gray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
  },
  inputContainer: {
    width: "80%",
    marginBottom: 20,
  },
});