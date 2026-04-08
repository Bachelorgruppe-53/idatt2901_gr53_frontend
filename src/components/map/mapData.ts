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
  area: string;
}

export interface MapDto {
  title: string;
  lat: number;
  lon: number;
  place: string;
  area?: string;
  color: number;
}

export interface MapArea {
  id: string;
  label: string;
  value: string | null;
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
  area: poi.area ?? poi.place,
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

const parsePoiArray = async (response: Response): Promise<MapDto[]> => {
  const data = await response.json();
  const poiArray = Array.isArray(data) ? data : data.body || data.data || [];

  if (!Array.isArray(poiArray)) return [];
  return poiArray as MapDto[];
};

const fetchWithRetryOnInvalidUser = async (
  url: string,
  areaName: string | null,
): Promise<Response> => {
  let userId = await ensureUserId();
  let response: Response;

  if (areaName === null) {
    response = await fetchPoiWithUserId(url, userId);
  } else {
    response = await fetchPoiByAreaWithUserId(url, userId, areaName);
  }

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 400 && errorText.includes("Invalid UUID format")) {
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

  return response;
};

export const fetchLocations = async (
  areaName: string | null = null,
  selectedLanguage?: string,
): Promise<MapLocation[]> => {
  try {
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const languageCode = getLanguageCode(selectedLanguage);
    const url = buildPoiUrl(baseUrl, areaName, languageCode);
    const response = await fetchWithRetryOnInvalidUser(url, areaName);
    const poiArray = await parsePoiArray(response);
    return poiArray.map(mapDtoToMapLocation);
  } catch (error) {
    console.error("Failed to fetch POI locations:", error);
    return [];
  }
};

export const fetchAreas = async (
  selectedLanguage?: string,
): Promise<MapArea[]> => {
  try {
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const languageCode = getLanguageCode(selectedLanguage);
    const url = buildPoiUrl(baseUrl, null, languageCode);
    const response = await fetchWithRetryOnInvalidUser(url, null);
    const poiArray = await parsePoiArray(response);

    const uniqueAreas = Array.from(
      new Set(
        poiArray
          .map((poi) => poi.area?.trim() || poi.place?.trim())
          .filter((area): area is string => Boolean(area)),
      ),
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    return uniqueAreas.map((areaName, index) => ({
      id: `area-${index}-${areaName}`,
      label: areaName,
      value: areaName,
    }));
  } catch (error) {
    console.error("Failed to fetch map areas:", error);
    return [];
  }
};

export const locations: MapLocation[] = [];
