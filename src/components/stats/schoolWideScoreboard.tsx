import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import {
  GET_SCHOOL_CLASSES_PATH,
  GetSchoolClassesRequest,
  GetSchoolClassesResponse,
  SchoolClassSummary,
  UserIdHeader,
} from "@/services/types/schoolClass";
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
import { ThemeContext } from "@react-navigation/native";

/**
 * School-wide scoreboard that lists all classes in the user's school.
 *
 * @returns JSX.Element
 */
export default function SchoolScoreboard() {
  const [entities, setEntities] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userClass, setUserClass] = useState<string | null>(null);
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
    // Fetch user summary to obtain school and class context.
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
        setUserClass(summary.className);
        if (!summary.schoolName) {
          setError("User is not registered to a school");
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

    // Normalize responses that may come as paged or raw arrays.
    const normalizeSchoolClasses = (
      response: GetSchoolClassesResponse,
    ): SchoolClassSummary[] | null => {
      if (Array.isArray(response)) {
        return response;
      }

      if (
        response &&
        typeof response === "object" &&
        Array.isArray(response.content)
      ) {
        return response.content;
      }

      return null;
    };

    // Fetch all classes for a given school name.
    const getSchoolClasses = async (
      name: string,
    ): Promise<GetSchoolClassesResponse> => {
      const requestBody: GetSchoolClassesRequest = {
        name,
      };

      const userId = await ensureUserId();

      const headers: UserIdHeader = {
        "X-User-ID": userId,
      };

      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const response = await axios.post<GetSchoolClassesResponse>(
        `${baseUrl}${GET_SCHOOL_CLASSES_PATH}`,
        requestBody,
        { headers },
      );
      return response.data;
    };

    // Load school classes and map them into the scoreboard.
    const loadSchoolClasses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First fetch user summary to get school name.
        const summary = await getSummary();
        if (!summary) {
          return;
        }

        const classesResponse = await getSchoolClasses(summary.schoolName);
        const classes = normalizeSchoolClasses(classesResponse);

        // Backend returns a string message when user is not authorized
        if (typeof classesResponse === "string") {
          setError(classesResponse);
          console.warn("Authorization issue:", classesResponse);
          return;
        }

        if (!classes) {
          console.error(
            "Expected array or paged response, got:",
            classesResponse,
          );
          setError("Unexpected response format from server");
          return;
        }

        if (classes.length === 0) {
          setError("No classes found for this school");
          return;
        }

        setEntities(classes.map((item) => item.className));
        setScores(classes.map((item) => item.points));

        const highlightedClass = classes.find(
          (item) => item.className === summary.className,
        );
        setPoints(highlightedClass?.points ?? 0);
      } catch (error) {
        console.error("Failed to load school classes:", error);
        setError("Failed to load school classes");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSchoolClasses();
  }, []);

  if (error) {
    return (
      <View style={themedStyles.container}>
        <Text style={themedStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={BaseStyles.flex}>
      <Scoreboard
        entities={entities}
        scores={scores}
        scoreboardType="schoolScoreboard"
        pointsLabel="classPoints"
        points={points}
        isLoading={isLoading}
        highlightedEntity={userClass ?? undefined}
      />
    </View>
  );
}
