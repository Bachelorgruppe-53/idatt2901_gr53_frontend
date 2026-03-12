import { ensureUserId } from "@/services/authService";
import { getApiBaseUrl } from "@/services/apiConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BaseStyles } from "../../constants/Styles";
import { useThemedStyles } from "../../hooks/useStyleSheet";
import { useThemeColor } from "../../hooks/useThemeColor";
import QuizModal from "../quiz/quizModal";
import { useCareerQuiz } from "../../hooks/useQuiz";
import { Colors } from "@/src/constants/Colors";

/**
 * AboutCareer component that displays information about a career point of interest (POI) and includes a quiz to unlock points. It handles fetching career data, displaying it, and managing the quiz state and interactions.
 * 
 * @param {Props} props - The props for the AboutCareer component, including careerId and onClose callback.
 * @returns {JSX.Element} The rendered AboutCareer component.
 */

interface PoiDto {
  id: number;
  title: string;
  description: string;
  points: number;
  color: number;
}

interface Props {
  careerId: number | null;
  onClose: () => void;
}

export default function AboutCareer({ careerId, onClose }: Props) {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  const { t } = useTranslation("aboutCareer");

  const [data, setData] = useState<PoiDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);


  const handleClaimSuccess = () => {
    setShowSuccessBanner(true);
  };

  const {
    showQuiz,
    setShowQuiz,
    quizCompleted,
    quizLoading,
    quizQuestions,
    quizErrorMsg,
    isSubmittingClaim,
    fetchQuiz,
    handleAnswer,
    handleQuizComplete,
  } = useCareerQuiz({
    careerId,
    onClaimSuccess: handleClaimSuccess,
  });

  useEffect(() => {
    if (!showSuccessBanner) return;

    const timer = setTimeout(() => {
      onClose();
    }, 1800);

    return () => clearTimeout(timer);
  }, [showSuccessBanner, onClose]);

  useEffect(() => {
    if (careerId === null) return;

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const userId = await ensureUserId();
        const baseUrl = getApiBaseUrl().replace(/\/$/, "");

        const res = await fetch(`${baseUrl}/career/career`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-User-ID": userId,
          },
          body: JSON.stringify({ id: careerId }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const json = (await res.json()) as PoiDto | string;
        if (typeof json === "string") {
          setErrorMsg(json);
          setData(null);
        } else {
          setData(json);
        }
      } catch {
        setErrorMsg(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [careerId, t]);

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

        {showSuccessBanner && (
          <View
            style={{
              width: "100%",
              marginBottom: 16,
              padding: 14,
              borderRadius: 12,
              backgroundColor: Colors.brand.turquoise + "20",
              borderLeftWidth: 5,
              borderLeftColor: Colors.brand.turquoise,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name="check-circle"
              size={22}
              color={Colors.brand.turquoise}
            />
            <Text
              style={{
                marginLeft: 10,
                color: Colors.brand.turquoise,
                fontWeight: "600",
                flex: 1,
              }}
            >
              {t(
                "claimSuccessMessage",
                "Du fullførte quizen og fikk poengene dine.",
              )}
            </Text>
          </View>
        )}

        <View style={BaseStyles.mb16}>
          <Text style={[themedStyles.heading, BaseStyles.rowCenter, BaseStyles.p8]}>
            {data?.title || t("unknownTitle")}
          </Text>
        </View>

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

        <Text style={[themedStyles.text, BaseStyles.m16]}>
          {data?.description || t("noDescription")}
        </Text>

        <QuizModal
          visible={showQuiz}
          title={data?.title}
          questions={quizQuestions}
          isLoading={quizLoading}
          onAnswer={handleAnswer}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />

        <View style={BaseStyles.p16}>
          {!quizCompleted ? (
            <Pressable style={themedStyles.button} onPress={fetchQuiz}>
              <Text style={themedStyles.buttonText}>
                {t("startQuiz", "Ta quiz for å låse opp")}
              </Text>
            </Pressable>
          ) : (
            <View
              style={[
                themedStyles.button,
                { opacity: 0.7, flexDirection: "row" },
              ]}
            >
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[themedStyles.buttonText, { marginLeft: 10 }]}>
                {t("submitting", "Sender svar...")}
              </Text>
            </View>
          )}

          {quizErrorMsg && (
            <View
              style={{
                marginTop: 20,
                padding: 15,
                backgroundColor: Colors.brand.red + "20",
                borderRadius: 10,
                borderLeftWidth: 5,
                borderLeftColor: Colors.brand.red,
              }}
            >
              <Text style={{ color: Colors.brand.red, fontWeight: "bold" }}>
                {quizErrorMsg}
              </Text>
            </View>
          )}
        </View>

        <Pressable style={themedStyles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color={theme.text} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}