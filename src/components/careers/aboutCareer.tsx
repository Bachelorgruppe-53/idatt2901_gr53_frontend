import { ensureUserId } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { BaseStyles } from "../../constants/Styles";
import { useThemedStyles } from "../../hooks/useStyleSheet";
import { useThemeColor } from "../../hooks/useThemeColor";

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
  color: number;
  area: string;
  place: string;
}

interface Props {
  careerName: string | null;
  onClose: () => void;
}

export default function AboutCareer({ careerName, onClose }: Props) {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

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
        const userId = await ensureUserId();
        console.log("Fetching career data for:", careerName);
        console.log("Using user ID:", userId);

        const res = await fetch(`${getBaseURL()}/poi/career`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-User-ID": userId,
          },
          body: JSON.stringify({ name: careerName }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
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
      <View style={themedStyles.container}>
        <ActivityIndicator size="large" color={theme.button} />
      </View>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      <ScrollView contentContainerStyle={themedStyles.content}>
        <View style={BaseStyles.mb16}>
          <Text
            style={[themedStyles.heading, BaseStyles.rowCenter, BaseStyles.p8]}
          >
            {data?.title || careerName || t("unknownTitle")}
          </Text>
          {typeof data?.points === "number" && (
            <View style={[BaseStyles.rowCenter, BaseStyles.gap4]}>
              <MaterialIcons
                name="stars"
                size={16}
                color={Colors.brand.darkYellow}
              />
              <Text style={themedStyles.semiboldText}>
                {data.points} {t("points")}
              </Text>
            </View>
          )}
        </View>

        {errorMsg ? (
          <Text style={themedStyles.text}>{errorMsg}</Text>
        ) : (
          <Text style={[themedStyles.text, BaseStyles.m16]}>
            {data?.description || t("noDescription")}
          </Text>
        )}

        <Pressable
          style={themedStyles.button}
          onPress={() => alert("Claim yrke funksjonalitet kommer snart!")}
        >
          <Text style={[themedStyles.buttonText]}>{t("claimButton")}</Text>
        </Pressable>

        <Pressable style={themedStyles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color={theme.text} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
