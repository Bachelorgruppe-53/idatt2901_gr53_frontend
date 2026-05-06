import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import {
  GET_CLASS_PATH,
  GetClassRequest,
  GetClassResponse,
  UserIdHeader,
} from "@/services/types/class";
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
import { useCallback, useRef, useState, useEffect } from "react";
import { Text, View } from "react-native";

/**
 * Class-wide scoreboard that lists all members of the user's class.
 *
 * @returns JSX.Element
 */

const getBackendErrorMessage = (data: unknown): string => {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return "";
};

const normalizeMembers = (
  payload: unknown,
): Array<{ nickname: string; points: number }> => {
  if (Array.isArray(payload)) return payload as Array<{ nickname: string; points: number }>;

  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const list = p.list as Record<string, unknown> | undefined;
    const data = p.data as Record<string, unknown> | undefined;

    const candidates = [list?.content, p.content, p.members, data?.content, data?.members];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Array<{ nickname: string; points: number }>;
      }
    }
  }

  return [];
};

export default function ClassScoreboard() {
  const [entities, setEntities] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const themedStyles = useThemedStyles();
  const inFlightRef = useRef(false);

  const getSummary = useCallback(async (userId: string): Promise<UserSummary | null> => {
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const headers: UserIdHeader = { "X-User-ID": userId };

    try {
      const response = await axios.get<GetSummaryResponse>(`${baseUrl}${GET_SUMMARY_PATH}`, { headers });
      const summary = response.data;

      setPoints(summary.points ?? 0);
      setCurrentNickname(summary.nickname ?? "");
      setClassName(summary.className ?? "");

      if (!summary.classCode) {
        setError("You need to join a class");
        return null;
      }

      return summary;
    } catch (err) {
      if (isAxiosError(err)) {
        const backendMessage = getBackendErrorMessage(err.response?.data).toLowerCase();

        if (backendMessage.includes("not related to a class")) {
          setError("You need to join a class");
        } else {
          console.error("Failed to fetch summary:", err.response?.data);
          setError("Failed to load user information");
        }
      } else {
        console.error("Failed to fetch summary:", err);
        setError("Failed to load user information");
      }
      return null;
    }
  }, []);

  const getClassMembers = useCallback(
    async (code: string, userId: string): Promise<GetClassResponse> => {
      const requestBody: GetClassRequest = { code };
      const headers: UserIdHeader = { "X-User-ID": userId };
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");

      const response = await axios.post<GetClassResponse>(
        `${baseUrl}${GET_CLASS_PATH}`,
        requestBody,
        { headers },
      );

      return response.data;
    },
    [],
  );

  const loadClassMembers = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      setError(null);
      setIsLoading((prev) => (entities.length === 0 ? true : prev));

      const userId = await ensureUserId();
      const summary = await getSummary(userId);
      if (!summary) return;

      const classResponse = await getClassMembers(summary.classCode, userId);
      const members = normalizeMembers(classResponse);

      if (members.length === 0) {
        setEntities([summary.nickname]);
        setScores([summary.points ?? 0]);
        return;
      }

      setEntities(members.map((member) => member.nickname));
      setScores(members.map((member) => member.points));
    } catch (err) {
      console.error("Failed to load class members:", err);
      setError("Failed to load class members");
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [entities.length, getClassMembers, getSummary, ensureUserId, normalizeMembers]);

  useFocusEffect(
    useCallback(() => {
      void loadClassMembers();

      const intervalId = setInterval(() => {
        void loadClassMembers();
      }, 10000); // refresh every 10s while screen is focused

      return () => clearInterval(intervalId);
    }, [loadClassMembers]),
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
        scoreboardType="classScoreboard"
        pointsLabel="yourPoints"
        points={points}
        isLoading={isLoading}
        highlightedEntity={currentNickname}
        titleOverride={className ? `${className}` : undefined}
      />
    </View>
  );
}
