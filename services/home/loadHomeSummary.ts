import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import {
  GET_CLASS_INFO_PATH,
  type GetClassInfoResponse,
  type GetClassRequest,
} from "@/services/types/class";
import type { UserSummary } from "@/services/types/summary";

/**
 * Loads the home summary data for the user, including their points, class points, and nickname.
 * Handles cases where the user is not associated with a class or when the user ID is invalid. Also includes error handling for unexpected server responses.
 *
 * @returns A promise that resolves to an object containing the user's summary, points, class points, and nickname.
 * @throws An error if the server response is not successful or if the response format is invalid.
 */

export type HomeSummaryResult = {
  summary: UserSummary | null;
  points: number;
  classPoints: number | null;
  nickname: string;
  // claimedCareers?: number; // Optional field for future use
};

const parseBackendError = (raw: string): string => {
  try {
    const parsed = JSON.parse(raw) as { message?: string; error?: string };
    return parsed.message ?? parsed.error ?? raw;
  } catch {
    return raw;
  }
};

export const loadHomeSummary = async (): Promise<HomeSummaryResult> => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");

  const requestSummary = async (userId: string) => {
    const res = await fetch(`${baseUrl}/user/summary`, {
      headers: { "X-User-ID": userId },
    });
    const raw = await res.text();
    return { res, raw };
  };

  let userId = await ensureUserId();
  let { res, raw } = await requestSummary(userId);

  if (!res.ok && res.status === 400 && raw.includes("Invalid UUID format")) {
    userId = await registerDevice();
    ({ res, raw } = await requestSummary(userId));
  }

  if (raw.toLowerCase().includes("not related to a class")) {
    return { summary: null, points: 0, classPoints: null, nickname: "" };
  }

  if (raw.startsWith("This user")) {
    return { summary: null, points: 0, classPoints: null, nickname: "" };
  }

  if (!res.ok) {
    throw new Error(parseBackendError(raw));
  }

  let summary: UserSummary;
  try {
    summary = JSON.parse(raw) as UserSummary;
  } catch {
    console.error("Failed to parse summary response:", raw);
    throw new Error("Invalid server response format");
  }

  const points = Number(summary.points) || 0;

  let classPoints: number | null = null;
  try {
    const requestBody: GetClassRequest = {
      code: summary.classCode,
    };

    const classInfoRes = await fetch(`${baseUrl}${GET_CLASS_INFO_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-User-ID": userId,
      },
      body: JSON.stringify(requestBody),
    });

    if (classInfoRes.ok) {
      const classInfo = (await classInfoRes.json()) as GetClassInfoResponse;
      classPoints = Number(classInfo.points) || 0;
    }
  } catch {
    classPoints = null;
  }

  return {
    summary,
    points,
    classPoints,
    nickname: summary.nickname ?? "",
    // claimedCareers: summary.claimedCareers, // Optional field for future use
  };
};
