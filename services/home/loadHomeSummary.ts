import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import type { GetSchoolClassesResponse, SchoolClassSummary } from "@/services/types/schoolClass";
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

// Todo: Implement classPoints fetching later when backend supports it. For now, it will be returned as null.
//type ClassInfoDto = {
//  className: string;
//  schoolName: string;
//  points: number | string;
//};

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

//   if (!summary.classCode) {
//     console.log(" ------------ User is not associated with any class");
//     return {
//       summary,
//       points,
//       classPoints: null,
//       nickname: summary.nickname ?? "",
//     };
//   }

//   const classRes = await fetch(`${baseUrl}/class/info`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-User-ID": userId,
//     },
//     body: JSON.stringify({ code: summary.classCode }),
//   });

//   console.log(" ------------ Fetching class info for class code:", summary.classCode);
  
//   if (!classRes.ok) {
//     console.log(" ------------ Failed to fetch class info");
//     console.error("Failed to fetch class info:", await classRes.text());
//     return {
//       summary,
//       points,
//       classPoints: null,
//       nickname: summary.nickname ?? "",
//     };
//   }

//   const classInfo = (await classRes.json()) as ClassInfoDto;
//   const classPoints = Number(classInfo.points) || 0;

//   console.log(" ------------ Successfully fetched class info with points:", classPoints);

  return {
    summary,
    points,
    classPoints: null, // implement later
    nickname: summary.nickname ?? "",
    // claimedCareers: summary.claimedCareers, // Optional field for future use
  };
};