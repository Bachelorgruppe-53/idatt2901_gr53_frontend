import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { getLanguageCode } from "@/services/language/languageCode";
import { COLOR_BY_CODE } from "@/src/constants/ColorMap";
import { Colors } from "@/src/constants/Colors";

export interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  place: string;
  color?: string;
}

export interface MapDto {
  title: string;
  lat: number;
  lon: number;
  place: string;
  color: number;
}

interface StringRequest {
  name: string;
}

const mapPoiColorToBrandColor = (colorCode: number): string =>
  COLOR_BY_CODE[colorCode] ?? Colors.brand.darkBlue;

const mapDtoToMapLocation = (poi: MapDto, index: number): MapLocation => ({
  id: String(index),
  latitude: poi.lat,
  longitude: poi.lon,
  title: poi.title,
  place: poi.place,
  color: mapPoiColorToBrandColor(poi.color),
});

const fetchPoiWithUserId = async (url: string, userId: string) => {
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-User-ID": userId,
    },
  });
};

const fetchPoiByAreaWithUserId = async (
  url: string,
  userId: string,
  areaName: string,
) => {
  const body: StringRequest = { name: areaName };

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-User-ID": userId,
    },
    body: JSON.stringify(body),
  });
};

const buildPoiUrl = (
  baseUrl: string,
  areaName: string | null,
  languageCode: string,
): string => {
  const path = areaName === null ? "/poi/all" : "/poi/area";
  return `${baseUrl}${path}/${encodeURIComponent(languageCode)}`;
};

export const fetchLocations = async (
  areaName: string | null = null,
  selectedLanguage?: string,
): Promise<MapLocation[]> => {
  try {
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const languageCode = getLanguageCode(selectedLanguage);

    let userId = await ensureUserId();
    let response: Response;
    const url = buildPoiUrl(baseUrl, areaName, languageCode);

    if (areaName === null) {
      response = await fetchPoiWithUserId(url, userId);
    } else {
      response = await fetchPoiByAreaWithUserId(url, userId, areaName);
    }

    if (!response.ok) {
      const errorText = await response.text();

      if (
        response.status === 400 &&
        errorText.includes("Invalid UUID format")
      ) {
        userId = await registerDevice();

        if (areaName === null) {
          response = await fetchPoiWithUserId(url, userId);
        } else {
          response = await fetchPoiByAreaWithUserId(url, userId, areaName);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const poiArray = Array.isArray(data) ? data : data.body || data.data || [];

    if (!Array.isArray(poiArray)) return [];
    return poiArray.map(mapDtoToMapLocation);
  } catch (error) {
    console.error("Failed to fetch POI locations:", error);
    return [];
  }
};

export const locations: MapLocation[] = [];
