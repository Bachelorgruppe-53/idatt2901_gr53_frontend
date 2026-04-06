import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import {
    GET_CLASS_INFO_PATH,
    GetClassInfoResponse,
} from "@/services/types/class";
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
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { BaseStyles } from "../../constants/Styles";

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
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const themedStyles = useThemedStyles();

  const normalizeSchoolClasses = (payload: unknown): SchoolClassSummary[] => {
    const extractList = (value: unknown): unknown[] => {
      if (Array.isArray(value)) return value;
      if (!value || typeof value !== "object") return [];

      const objectValue = value as Record<string, unknown>;
      const candidates = [
        objectValue.content,
        objectValue.list,
        (objectValue.list as Record<string, unknown> | undefined)?.content,
        objectValue.data,
        (objectValue.data as Record<string, unknown> | undefined)?.content,
      ];

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate;
        }
      }

      return [];
    };

    const rawItems = extractList(payload);

    return rawItems
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const row = item as Record<string, unknown>;
        const classNameCandidate = row.className ?? row.name;
        const pointsCandidate = row.points ?? row.score;

        const className =
          typeof classNameCandidate === "string"
            ? classNameCandidate.trim()
            : "";
        const points =
          typeof pointsCandidate === "number" &&
          Number.isFinite(pointsCandidate)
            ? pointsCandidate
            : 0;

        if (!className) return null;

        return { className, points };
      })
      .filter((item): item is SchoolClassSummary => item !== null);
  };

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
        setSchoolName(summary.schoolName);
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

    const getClassInfo = async (
      userId: string,
      classCode: string,
    ): Promise<GetClassInfoResponse> => {
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const headers: UserIdHeader = { "X-User-ID": userId };

      const response = await axios.post<GetClassInfoResponse>(
        `${baseUrl}${GET_CLASS_INFO_PATH}`,
        { code: classCode },
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

        const userId = await ensureUserId();
        const classesResponse = await getSchoolClasses(summary.schoolName);
        const classes = normalizeSchoolClasses(classesResponse);

        // Backend returns a string message when user is not authorized
        if (typeof classesResponse === "string") {
          setError(classesResponse);
          console.warn("Authorization issue:", classesResponse);
          return;
        }

        if (classes.length === 0) {
          setError("No classes found for this school");
          return;
        }

        setEntities(classes.map((item) => item.className));
        setScores(classes.map((item) => item.points));

        try {
          const classInfo = await getClassInfo(userId, summary.classCode);
          setPoints(classInfo.points ?? 0);
        } catch {
          const normalizedUserClass = summary.className?.trim().toLowerCase();
          const highlightedClass = classes.find(
            (item) =>
              item.className.trim().toLowerCase() === normalizedUserClass,
          );
          setPoints(highlightedClass?.points ?? 0);
        }
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
        titleOverride={schoolName ?? undefined}
      />
    </View>
  );
}
