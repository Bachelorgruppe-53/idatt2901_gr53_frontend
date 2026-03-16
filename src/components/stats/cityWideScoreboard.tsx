import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import {
  GET_COUNTY_PATH,
  GetCountyRequest,
  GetCountyResponse,
  UserIdHeader,
} from "@/services/types/county";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const themedStyles = useThemedStyles();
  const inFlightRef = useRef(false);

  const getCountySchools = useCallback(
    async (name: string, userId: string): Promise<GetCountyResponse> => {
      const requestBody: GetCountyRequest = { name };
      const headers: UserIdHeader = { "X-User-ID": userId };
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");

      const response = await axios.post<GetCountyResponse>(
        `${baseUrl}${GET_COUNTY_PATH}`,
        requestBody,
        { headers },
      );

      return response.data;
    },
    [],
  );

  const loadCountySchools = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      setError(null);
      setIsLoading((prev) => (entities.length === 0 ? true : prev));

      const userId = await ensureUserId();
      const response = await getCountySchools(DEFAULT_COUNTY_NAME, userId);

      const schools = Array.isArray(response.content) ? response.content : [];

      setEntities(schools.map((school) => school.className));
      setScores(schools.map((school) => school.points));
    } catch (err) {
      if (isAxiosError(err)) {
        const backendMessage = getBackendErrorMessage(err.response?.data);
        setError(backendMessage || "Failed to load county scoreboard");
      } else {
        setError("Failed to load county scoreboard");
      }
      console.error("Failed to load county scoreboard:", err);
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [entities.length, getCountySchools]);

  useFocusEffect(
    useCallback(() => {
      void loadCountySchools();

      const intervalId = setInterval(() => {
        void loadCountySchools();
      }, 10000);

      return () => clearInterval(intervalId);
    }, [loadCountySchools]),
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
        points={0}
        isLoading={isLoading}
        titleOverride={DEFAULT_COUNTY_NAME}
      />
    </View>
  );
}
