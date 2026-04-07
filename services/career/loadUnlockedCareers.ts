import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { getLanguageCode } from "@/services/language/languageCode";
import type { CareerDto, UnlockedCareer } from "@/services/types/career";

const CAREER_ENDPOINTS = ["/career/claimed", "/careers/claimed"] as const;

const isUuidError = (status: number, body: string) =>
  status === 400 && body.includes("Invalid UUID format");

const fetchCareersFromEndpointGet = async (
  endpoint: string,
  userId: string,
  languageCode: string,
): Promise<Response> => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");

  return fetch(`${baseUrl}${endpoint}/${encodeURIComponent(languageCode)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-User-ID": userId,
      "x-user-id": userId,
    },
  });
};

const fetchCareersFromEndpointPost = async (
  endpoint: string,
  userId: string,
  languageCode: string,
): Promise<Response> => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");

  return fetch(`${baseUrl}${endpoint}/${encodeURIComponent(languageCode)}`, {
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

const readNumber = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const readString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

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

export const loadUnlockedCareers = async (
  selectedLanguage?: string,
): Promise<UnlockedCareer[]> => {
  const languageCode = getLanguageCode(selectedLanguage);
  let userId = await ensureUserId();

  for (const endpoint of CAREER_ENDPOINTS) {
    try {
      const fetchCareersWithFallback = async (currentUserId: string) => {
        let response = await fetchCareersFromEndpointGet(
          endpoint,
          currentUserId,
          languageCode,
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
      if (careers.length > 0) {
        return careers;
      }
    } catch {
      continue;
    }
  }

  return [];
};
