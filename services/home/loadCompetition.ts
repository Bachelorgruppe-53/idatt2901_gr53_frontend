import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import { getLanguageCode } from "@/services/language/languageCode";

const COMPETITION_DEBUG = __DEV__;

export type CompetitionInfo = {
  id: number;
  title: string;
  active: boolean;
  startTime: string;
  endTime: string;
  area: string;
};

export const loadCompetition = async (
  language?: string,
): Promise<CompetitionInfo | null> => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const languageCode = getLanguageCode(language);
  const userId = await ensureUserId();
  const url = `${baseUrl}/competition/comp/${encodeURIComponent(languageCode)}`;

  if (COMPETITION_DEBUG) {
    console.log("[competition] loadCompetition start", {
      language,
      languageCode,
      url,
    });
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-User-ID": userId,
      },
    });

    if (COMPETITION_DEBUG) {
      console.log("[competition] loadCompetition response", {
        ok: res.ok,
        status: res.status,
      });
    }

    if (!res.ok) {
      if (COMPETITION_DEBUG) {
        const errorText = await res.text();
        console.log("[competition] loadCompetition non-ok body", errorText);
      }
      return null;
    }

    const data = (await res.json()) as CompetitionInfo;

    if (COMPETITION_DEBUG) {
      console.log("[competition] loadCompetition payload", data);
    }

    if (
      !data ||
      typeof data !== "object" ||
      typeof data.title !== "string" ||
      typeof data.startTime !== "string" ||
      typeof data.endTime !== "string"
    ) {
      if (COMPETITION_DEBUG) {
        console.log(
          "[competition] loadCompetition invalid payload shape",
          data,
        );
      }
      return null;
    }

    if (COMPETITION_DEBUG) {
      console.log("[competition] loadCompetition success", {
        id: data.id,
        title: data.title,
        active: data.active,
        startTime: data.startTime,
        endTime: data.endTime,
        area: data.area,
      });
    }

    return data;
  } catch (error) {
    if (COMPETITION_DEBUG) {
      console.log("[competition] loadCompetition exception", error);
    }
    return null;
  }
};
