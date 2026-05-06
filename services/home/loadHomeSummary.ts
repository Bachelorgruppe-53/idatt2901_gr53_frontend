import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import {
  GET_CLASS_INFO_PATH,
  type GetClassInfoResponse,
  type GetClassRequest,
} from "@/services/types/class";
import type { UserSummary } from "@/services/types/summary";

// Type definition for the result returned by the loadHomeSummary function, which includes the user's summary, points, class points, and nickname.
export type HomeSummaryResult = {
  summary: UserSummary | null;
  points: number;
  classPoints: number | null;
  nickname: string;
};

/**
 * Parses an error response from the backend to extract a meaningful error message. It attempts to parse the response as JSON and look for common error fields, falling back to the raw response if parsing fails.
 *
 * @param raw - The raw error response from the backend, which may be a JSON string or a plain text message.
 * @returns A string containing the extracted error message, or the original raw response if it cannot be parsed.
 */

const parseBackendError = (raw: string): string => {
  try {
    const parsed = JSON.parse(raw) as { message?: string; error?: string };
    return parsed.message ?? parsed.error ?? raw;
  } catch {
    return raw;
  }
};

/**
 * Loads the user's home summary information from the backend API, including their points, class points, and nickname. 
 * It handles various response scenarios, including errors and cases where the user is not related to a class. 
 * If the user's UUID is invalid, it attempts to re-register the device and retry the request.
 * 
 * @returns A promise that resolves to an object containing the user's summary, points, class points, and nickname.
 * @throws An error if the server response is not successful or if the response format is invalid.
 */
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
  };
};
