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
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BaseStyles } from "../../constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";

/**
 * Class-wide scoreboard that lists all members of the user's class.
 *
 * @returns JSX.Element
 */
export default function ClassScoreboard() {
  const [entities, setEntities] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNickname, setCurrentNickname] = useState<string>("");
  const themedStyles = useThemedStyles();

  const getBackendErrorMessage = (data: unknown): string => {
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "error" in data) {
      const value = (data as { error?: unknown }).error;
      if (typeof value === "string") return value;
    }
    return "";
  };

  useEffect(() => {
    // Fetch user summary to obtain class code and current nickname.
    const getSummary = async (): Promise<UserSummary | null> => {
      const userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const headers: UserIdHeader = {
        "X-User-ID": userId,
      };

      try {
        const response = await axios.get<GetSummaryResponse>(
          `${baseUrl}${GET_SUMMARY_PATH}`,
          { headers },
        );

        const summary = response.data;
        setPoints(summary.points);
        setCurrentNickname(summary.nickname);
        if (!summary.classCode) {
          setError("User is not registered to a class");
          return null;
        }

        return summary;
      } catch (err) {
        if (isAxiosError(err)) {
          const backendMessage = getBackendErrorMessage(err.response?.data);

          if (
            err.response?.status === 400 &&
            backendMessage.includes("not related to a class")
          ) {
            setError("You need to join a class");
          } else if (err.response?.status === 401) {
            setError("User not found");
          } else if (err.response?.status === 403) {
            setError("User is not registered to a school");
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
    };

    // Fetch class members by class code.
    const getClassMembers = async (code: string): Promise<GetClassResponse> => {
      const requestBody: GetClassRequest = {
        code,
      };

      const userId = await ensureUserId();

      const headers: UserIdHeader = {
        "X-User-ID": userId,
      };

      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const response = await axios.post<GetClassResponse>(
        `${baseUrl}${GET_CLASS_PATH}`,
        requestBody,
        { headers },
      );

      return response.data;
    };

    // Load and map class members into the scoreboard.
    const loadClassMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First fetch user summary to get class code.
        const summary = await getSummary();
        if (!summary) {
          return;
        }

        const classResponse = await getClassMembers(summary.classCode);
        const members = classResponse.list?.content ?? [];

        if (members.length === 0) {
          setError("No class members found");
          return;
        }

        setEntities(members.map((member) => member.nickname));
        setScores(members.map((member) => member.points));
      } catch (error) {
        console.error("Failed to load class members:", error);
        setError("Failed to load class members");
      } finally {
        setIsLoading(false);
      }
    };

    void loadClassMembers();
  }, []);

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
      />
    </View>
  );
}