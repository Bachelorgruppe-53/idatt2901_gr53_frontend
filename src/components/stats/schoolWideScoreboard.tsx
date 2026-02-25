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

export default function SchoolScoreboard() {
  const [entities, setEntities] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        if (!summary.schoolName) {
          setError("User is not registered to a school");
          return null;
        }

        console.log("User school:", summary.schoolName);
        return summary;
      } catch (err) {
        if (isAxiosError(err)) {
          if (err.response?.status === 401) {
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

    const loadSchoolClasses = async () => {
      try {
        setError(null);

        // First fetch user summary to get school name
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
      } catch (error) {
        console.error("Failed to load school classes:", error);
        setError("Failed to load school classes");
      }
    };

    void loadSchoolClasses();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Scoreboard
        entities={entities}
        scores={scores}
        scoreboardType="schoolWide"
        pointsLabel="yourPoints"
        points={points}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
