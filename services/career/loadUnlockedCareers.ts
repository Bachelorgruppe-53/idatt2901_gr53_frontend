import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { getLanguageCode } from "@/services/language/languageCode";
import type {
  CareerDto,
  PaginatedCareers,
  PaginationInfo,
  UnlockedCareer,
} from "@/services/types/career";

/**
 * Loads the list of unlocked/claimed careers for the user, with support for pagination and multiple backend endpoint formats.
 */

const CAREER_ENDPOINTS = ["/career/claimed"] as const;

// Helper function to determine if an error response indicates an invalid UUID, which may require re-registering the device.
const isUuidError = (status: number, body: string) =>
  status === 400 && body.includes("Invalid UUID format");

// Helper function to perform a GET request to fetch careers from a specified endpoint.
const fetchCareersFromEndpointGet = async (
  endpoint: string,
  userId: string,
  languageCode: string,
  page: number = 0,
): Promise<Response> => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const url = new URL(
    `${baseUrl}${endpoint}/${encodeURIComponent(languageCode)}`,
  );
  url.searchParams.set("page", page.toString());

  return fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-User-ID": userId,
      "x-user-id": userId,
    },
  });
};

// Helper function to perform a POST request to fetch careers from a specified endpoint, used as a fallback if the GET request fails.
const fetchCareersFromEndpointPost = async (
  endpoint: string,
  userId: string,
  languageCode: string,
  page: number = 0,
): Promise<Response> => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const url = new URL(
    `${baseUrl}${endpoint}/${encodeURIComponent(languageCode)}`,
  );
  url.searchParams.set("page", page.toString());

  return fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-User-ID": userId,
      "x-user-id": userId,
    },
    body: JSON.stringify({}),
  });
};

/**
 * Utility function to read a number from a value that may be a number or a string. Returns null if the value cannot be parsed as a valid number.
 * @param value - The value to read as a number, which can be a number or a string.
 * @returns The parsed number, or null if the value is not a valid number.
 */
const readNumber = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

/**
 * Utility function to read a non-empty string from a value. Returns null if the value is not a string or is empty/whitespace.
 * @param value - The value to read as a string.
 * @returns The trimmed string, or null if the value is not a valid non-empty string.
 */
const readString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Normalizes a career object from various possible backend response formats into a consistent UnlockedCareer format used by the frontend.
 * @param careerInput - The raw career data from the backend, which may have different field names and structures.
 * @returns An UnlockedCareer object with standardized fields, or null if the input cannot be normalized.
 */
const normalizeCareer = (careerInput: unknown): UnlockedCareer | null => {
  if (!careerInput || typeof careerInput !== "object") {
    return null;
  }

  const career = careerInput as CareerDto & Record<string, unknown>;

  const careerId =
    readNumber(career.career_id) ??
    readNumber(career.id) ??
    readNumber(career.careerId);

  const name =
    readString(career.name) ??
    readString(career.title) ??
    readString(career.careerName);

  if (careerId === null || name === null) {
    return null;
  }

  const iconName =
    readString(career.iconName) ??
    readString(career.icon_name) ??
    readString(career.icon);

  const colorCode =
    readNumber(career.color) ??
    readNumber(career.colorCode) ??
    readNumber(career.color_code);

  return {
    career_id: careerId,
    name,
    iconName,
    colorCode,
  };
};

/**
 * Loads the list of unlocked/claimed careers for the user, with support for pagination and multiple backend endpoint formats.
 * It attempts to fetch the careers from a list of known endpoints, handling different response shapes and pagination metadata.
 * If a request fails due to an invalid UUID error, it will attempt to re-register the device and retry the request.
 * 
 * @param payload - The raw response payload from the backend, which may have different structures. The function will attempt to parse and normalize this into a consistent format.
 * @returns An object containing the list of unlocked careers and pagination information. If the request fails or the response cannot be parsed, it returns an empty list of careers and default pagination info.
 */
const extractPaginationInfo = (payload: unknown): PaginationInfo | null => {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (record.page && typeof record.page === "object") {
      const pageObj = record.page as Record<string, unknown>;
      return {
        size: readNumber(pageObj.size) ?? 10,
        number: readNumber(pageObj.number) ?? 0,
        totalElements: readNumber(pageObj.totalElements) ?? 0,
        totalPages: readNumber(pageObj.totalPages) ?? 0,
      };
    }
  }
  return null;
};

/**
 * Parses the raw response payload from the backend to extract a list of unlocked careers.
 * The function is designed to handle various response formats, including nested structures and different field names.
 * 
 * @param payload - The raw response payload from the backend.
 * @returns An array of UnlockedCareer objects.
 */
const parseCareers = (payload: unknown): UnlockedCareer[] => {
  if (typeof payload === "string") {
    try {
      return parseCareers(JSON.parse(payload));
    } catch {
      return [];
    }
  }

  if (Array.isArray(payload)) {
    return payload
      .map((entry) => normalizeCareer(entry))
      .filter((entry): entry is UnlockedCareer => entry !== null);
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nestedCandidates = [
      record.data,
      record.body,
      record.careers,
      record.result,
      record.items,
      record.content,
    ];

    for (const nested of nestedCandidates) {
      if (Array.isArray(nested)) {
        return nested
          .map((entry) => normalizeCareer(entry))
          .filter((entry): entry is UnlockedCareer => entry !== null);
      }

      if (typeof nested === "string") {
        const parsedNested = parseCareers(nested);
        if (parsedNested.length > 0) {
          return parsedNested;
        }
      }
    }
  }

  return [];
};

/**
 * Loads the list of unlocked/claimed careers for the user, with support for pagination and multiple backend endpoint formats.
 * @param selectedLanguage The language code to fetch the careers for, which will be included in the request URL. If not provided, the default language will be used.
 * @param page The page number to fetch for pagination. Defaults to 0.
 * @returns An object containing the list of unlocked careers and pagination information. If the request fails or the response cannot be parsed, it returns an empty list of careers and default pagination info.
 */
export const loadUnlockedCareers = async (
  selectedLanguage?: string,
  page: number = 0,
): Promise<PaginatedCareers> => {
  const languageCode = getLanguageCode(selectedLanguage);
  let userId = await ensureUserId();

  for (const endpoint of CAREER_ENDPOINTS) {
    try {
      const fetchCareersWithFallback = async (currentUserId: string) => {
        let response = await fetchCareersFromEndpointGet(
          endpoint,
          currentUserId,
          languageCode,
          page,
        );

        if (response.ok) {
          return { response, shouldReregister: false };
        }

        const getErrorText = await response.text();
        if (isUuidError(response.status, getErrorText)) {
          return { response, shouldReregister: true };
        }

        response = await fetchCareersFromEndpointPost(
          endpoint,
          currentUserId,
          languageCode,
          page,
        );

        if (response.ok) {
          return { response, shouldReregister: false };
        }

        const postErrorText = await response.text();
        return {
          response,
          shouldReregister: isUuidError(response.status, postErrorText),
        };
      };

      let { response, shouldReregister } =
        await fetchCareersWithFallback(userId);

      if (shouldReregister) {
        userId = await registerDevice();
        ({ response } = await fetchCareersWithFallback(userId));
      }

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as unknown;
      const careers = parseCareers(payload);
      const pagination = extractPaginationInfo(payload);

      // Some claimed-careers endpoints return a plain array without pagination metadata.
      // Build minimal pagination info so the frontend can still render and stop infinite scroll.
      const fallbackPagination: PaginationInfo = {
        size: careers.length,
        number: page,
        totalElements: careers.length,
        totalPages: careers.length > 0 ? 1 : 0,
      };

      if (pagination) {
        return { careers, pagination };
      }

      if (careers.length > 0) {
        return { careers, pagination: fallbackPagination };
      }
    } catch {
      continue;
    }
  }

  return {
    careers: [],
    pagination: { size: 10, number: 0, totalElements: 0, totalPages: 0 },
  };
};
