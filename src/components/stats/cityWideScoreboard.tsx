import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import {
  GET_COUNTY_CLASSES_PATH,
  GetCountyClassesResponse,
  UserIdHeader,
} from "@/services/types/county";
import {
  GET_SUMMARY_PATH,
  GetSummaryResponse,
  UserSummary,
} from "@/services/types/summary";
import Scoreboard from "@/src/components/stats/genericScoreboard";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import axios, { isAxiosError } from "axios";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Text, View } from "react-native";

const DEFAULT_COUNTY_NAME = "Trøndelag";

/**
 * Utility function to extract a user-friendly error message from the backend response.
 * It checks if the response data is a string or an object containing an "error" property and returns the appropriate message.
 * If no valid message is found, it returns an empty string.
 * @param data The response data from the backend, which can be of any type. The function will attempt to extract a meaningful error message from this data.
 * @returns A user-friendly error message or an empty string.
 */
const getBackendErrorMessage = (data: unknown): string => {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return "";
};

/**
 * CityScoreboard component that displays a scoreboard of classes in a county, showing their points and ranking.
 * It fetches data from the backend API, handles loading and error states, and updates the scoreboard at regular intervals.
 * The component also highlights the user's own class points for easy comparison.
 * @returns JSX.Element
 */
export default function CityScoreboard() {
  const [entities, setEntities] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [classPoints, setClassPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const themedStyles = useThemedStyles();
  const inFlightRef = useRef(false);

  // Function to fetch county classes and user summary from the backend API, handling authentication and error states.
  const getCountyClasses = useCallback(
    async (userId: string): Promise<GetCountyClassesResponse> => {
      const headers: UserIdHeader = { "X-User-ID": userId };
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");

      const response = await axios.get<GetCountyClassesResponse>(
        `${baseUrl}${GET_COUNTY_CLASSES_PATH}`,
        { headers },
      );

      return response.data;
    },
    [],
  );

  // Function to fetch user summary from the backend API, which includes information about the user's class and points.
  const getSummary = useCallback(
    async (userId: string): Promise<UserSummary> => {
      const headers: UserIdHeader = { "X-User-ID": userId };
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");

      const response = await axios.get<GetSummaryResponse>(
        `${baseUrl}${GET_SUMMARY_PATH}`,
        { headers },
      );

      return response.data;
    },
    [],
  );

  // Function to load county classes and user summary, update the scoreboard data, and handle loading and error states.
  const loadCountyClasses = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      setError(null);
      setIsLoading((prev) => (entities.length === 0 ? true : prev));

      const userId = await ensureUserId();
      const [response, summary] = await Promise.all([
        getCountyClasses(userId),
        getSummary(userId),
      ]);

      const classes = Array.isArray(response.content) ? response.content : [];

      setEntities(
        classes.map((item) => `${item.className} ${item.schoolName}`),
      );
      setScores(classes.map((item) => item.points));

      const ownClass = classes.find(
        (item) =>
          item.className === summary.className &&
          item.schoolName === summary.schoolName,
      );
      setClassPoints(ownClass?.points ?? 0);
    } catch (err) {
      if (isAxiosError(err)) {
        const backendMessage = getBackendErrorMessage(err.response?.data);
        setError(backendMessage || "Failed to load county scoreboard");
      } else {
        setError("Failed to load county scoreboard");
      }
      console.error("Failed to load county classes:", err);
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [entities.length, getCountyClasses, getSummary]);

  // useFocusEffect is used to load county classes when the component is focused and set up an interval to refresh the data every 10 seconds. The interval is cleared when the component is unfocused.
  useFocusEffect(
    useCallback(() => {
      void loadCountyClasses();

      const intervalId = setInterval(() => {
        void loadCountyClasses();
      }, 10000);

      return () => clearInterval(intervalId);
    }, [loadCountyClasses]),
  );

  if (error) {
    return (
      <View style={[themedStyles.content, BaseStyles.p24]}>
        <Text style={themedStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={BaseStyles.flex}>
      <Scoreboard
        entities={entities}
        scores={scores}
        scoreboardType="cityScoreboard"
        pointsLabel="classPoints"
        points={classPoints}
        isLoading={isLoading}
        titleOverride={DEFAULT_COUNTY_NAME}
      />
    </View>
  );
}
