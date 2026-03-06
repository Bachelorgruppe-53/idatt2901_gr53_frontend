import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { useThemeColor } from "../hooks/useThemeColor";

/**
 * Component to display detailed information about a career/POI.
 * Fetches data from the backend based on the provided career name.
 *
 * @param careerName - The name of the career to display information about.
 * @param onClose - Callback function to close the modal.
 *
 * @returns JSX.Element
 *
 * TODO: Implement "Claim" functionality to allow users to claim a career and earn points.
 */

interface PoiDto {
  title: string;
  description: string;
  lat: number;
  lon: number;
  points: number;
}

interface Props {
  careerName: string | null;
  onClose: () => void;
  onClaim?: () => void;
}

export default function AboutCareer({ careerName, onClose, onClaim }: Props) {
  const theme = useThemeColor();
  const [data, setData] = useState<PoiDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { t } = useTranslation("aboutCareer");

  const getBaseURL = () => {
    if (__DEV__) {
      if (Platform.OS === "android") return "http://10.0.2.2:8080";
      return "http://localhost:8080";
    }
    return ""; // TODO: Set production URL here
  };

  useEffect(() => {
    if (!careerName) return;

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`${getBaseURL()}/poi/career`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name: careerName }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
          setData(null);
          return;
        }

        const json = (await res.json()) as PoiDto;
        setData(json);
      } catch (err) {
        setErrorMsg(t("fetchError"));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [careerName]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.button} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {data?.title || careerName || t("unknownTitle")}
          </Text>
          {typeof data?.points === "number" && (
            <View style={styles.pointsBadge}>
              <MaterialIcons
                name="stars"
                size={16}
                color={Colors.brand.darkYellow}
              />
              <Text style={styles.pointsText}>
                {data.points} {t("points")}
              </Text>
            </View>
          )}
        </View>

        {errorMsg ? (
          <Text style={[styles.description, { color: theme.text }]}>
            {errorMsg}
          </Text>
        ) : (
          <Text style={[styles.description, { color: theme.text }]}>
            {data?.description || t("noDescription")}
          </Text>
        )}

        <Pressable
          style={[styles.button, { backgroundColor: theme.button }]}
          onPress={() => {
            if (typeof onClaim === "function") {
              onClaim();
            } else {
              alert("Claim yrke funksjonalitet kommer snart!");
            }
          }}
        >
          <Text style={[styles.link, { color: theme.buttontext }]}>
            {t("claimButton")}
          </Text>
        </Pressable>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={[styles.link, { color: theme.button }]}>
            {t("closeButton")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 40,
  },
  link: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  pointsText: {
    fontWeight: "600",
  },
  button: {
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  closeButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "transparent",
  },
});
