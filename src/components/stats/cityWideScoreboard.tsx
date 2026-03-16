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

const getBackendErrorMessage = (data: unknown): string => {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return "";
};

export default function CityScoreboard() {
  const [entities, setEntities] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [classPoints, setClassPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const themedStyles = useThemedStyles();
  const inFlightRef = useRef(false);

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
