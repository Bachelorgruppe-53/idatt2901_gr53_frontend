import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { getLanguageCode } from "@/services/language/languageCode";
import { COLOR_BY_CODE } from "@/src/constants/ColorMap";
import { Colors } from "@/src/constants/Colors";

/**
 * This file defines the types and functions related to fetching and managing map data, including points of interest (POIs) and areas.
 */
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

const allLocationsCache = new Map<string, MapLocation[]>();
const allLocationsPromiseCache = new Map<string, Promise<MapLocation[]>>();

// Maps a POI color code to a brand color. If the color code is not defined in the COLOR_BY_CODE mapping, it defaults to a dark blue color.
const mapPoiColorToBrandColor = (colorCode: number): string =>
  COLOR_BY_CODE[colorCode] ?? Colors.brand.darkBlue;

// Transforms a MapDto object into a MapLocation object, mapping the relevant fields and converting the color code to a brand color.
const mapDtoToMapLocation = (poi: MapDto, index: number): MapLocation => ({
  id: String(index),
  latitude: poi.lat,
  longitude: poi.lon,
  title: poi.title,
  place: poi.place,
  area: poi.area ?? poi.place,
  color: mapPoiColorToBrandColor(poi.color),
});

/**
 * Fetches points of interest (POIs) from the backend API, handling user authentication and retrying the request if an invalid user ID is detected.
 * If the initial request fails due to an invalid user ID, it attempts to register the device to obtain a new user ID and retries the request.
 * 
 * @param url The URL to fetch the POIs from, which is constructed based on the base API URL, area name, and language code.
 * @param userId The user ID to include in the request headers for authentication.
 * @returns A Promise that resolves to the Response object from the fetch request.
 */
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

// Similar to fetchPoiWithUserId but includes the area name in the request body for fetching POIs by area.
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

/**
 * Builds the URL for fetching POIs based on the base API URL, area name, and language code.
 * @param baseUrl The base URL of the API, which is typically obtained from the configuration.
 * @param areaName The name of the area to fetch POIs for. If null, it indicates that all POIs should be fetched.
 * @param languageCode The language code to include in the URL for localization purposes.
 * @returns The constructed URL for fetching POIs from the backend API.
 */
const buildPoiUrl = (
  baseUrl: string,
  areaName: string | null,
  languageCode: string,
): string => {
  const path = areaName === null ? "/poi/all" : "/poi/area";
  return `${baseUrl}${path}/${encodeURIComponent(languageCode)}`;
};

/**
 * Parses the response from the POI fetch request and extracts an array of MapDto objects.
 * @param response The Response object returned from the fetch request to the POI endpoint.
 * @returns A Promise that resolves to an array of MapDto objects extracted from the response. If the response does not contain a valid array, it returns an empty array.
 */
const parsePoiArray = async (response: Response): Promise<MapDto[]> => {
  const data = await response.json();
  const poiArray = Array.isArray(data) ? data : data.body || data.data || [];

  if (!Array.isArray(poiArray)) return [];
  return poiArray as MapDto[];
};

/**
 * Fetches POI data from the backend API with retry logic for handling invalid user IDs. 
 * If the initial request fails due to an invalid user ID, it attempts to register the device to obtain a new user ID and retries the request.
 * @param url The URL to fetch the POIs from, which is constructed based on the base API URL, area name, and language code.
 * @param areaName The name of the area to fetch POIs for. If null, it indicates that all POIs should be fetched.
 * @returns A Promise that resolves to the Response object from the fetch request. If the request fails after retrying, it throws an error with the relevant status and message.
 */
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

/**
 * Fetches all POI locations from the backend API, utilizing caching to optimize performance.
 * @param selectedLanguage The language code to fetch the POI data for, which is used to determine the appropriate cache key and API endpoint. If not provided, the default language will be used.
 * @returns A Promise that resolves to an array of MapLocation objects representing the fetched POI locations.
 */
const getAllLocations = async (
  selectedLanguage?: string,
): Promise<MapLocation[]> => {
  const languageCode = getLanguageCode(selectedLanguage);
  const cachedLocations = allLocationsCache.get(languageCode);

  if (cachedLocations) {
    return cachedLocations;
  }

  const cachedPromise = allLocationsPromiseCache.get(languageCode);
  if (cachedPromise) {
    return cachedPromise;
  }

  const loadPromise = (async () => {
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const url = buildPoiUrl(baseUrl, null, languageCode);
    const response = await fetchWithRetryOnInvalidUser(url, null);
    const poiArray = await parsePoiArray(response);
    const locations = poiArray.map(mapDtoToMapLocation);

    allLocationsCache.set(languageCode, locations);
    return locations;
  })();

  allLocationsPromiseCache.set(languageCode, loadPromise);

  try {
    return await loadPromise;
  } finally {
    allLocationsPromiseCache.delete(languageCode);
  }
};

/**
 * Fetches POI locations from the backend API based on the specified area name and selected language, handling user authentication and retrying the request if an invalid user ID is detected.
 * If the area name is null, it fetches all locations. Otherwise, it fetches locations specific to the given area.
 * @param areaName The name of the area to fetch POIs for. If null, it indicates that all POIs should be fetched.
 * @param selectedLanguage The language code to fetch the POI data for, which is used to determine the appropriate API endpoint and localization of the data. If not provided, the default language will be used.
 * @returns A Promise that resolves to an array of MapLocation objects representing the fetched POI locations for the specified area and language. If the fetch operation fails, it returns an empty array and logs the error to the console.
 */
export const fetchLocations = async (
  areaName: string | null = null,
  selectedLanguage?: string,
): Promise<MapLocation[]> => {
  try {
    const languageCode = getLanguageCode(selectedLanguage);

    if (areaName === null) {
      return await getAllLocations(selectedLanguage);
    }

    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const url = buildPoiUrl(baseUrl, areaName, languageCode);
    const response = await fetchWithRetryOnInvalidUser(url, areaName);
    const poiArray = await parsePoiArray(response);
    return poiArray.map(mapDtoToMapLocation);
  } catch (error) {
    console.error("Failed to fetch POI locations:", error);
    return [];
  }
};

/**
 * Fetches a list of unique area names from the fetched POI locations, utilizing the selected language for localization.
 * @param selectedLanguage The language code to fetch the area names for, which is used to determine the appropriate API endpoint and localization of the data. If not provided, the default language will be used.
 * @returns A Promise that resolves to an array of MapArea objects representing the unique area names.
 */
export const fetchAreas = async (
  selectedLanguage?: string,
): Promise<MapArea[]> => {
  try {
    const poiLocations = await getAllLocations(selectedLanguage);

    const uniqueAreas = Array.from(
      new Set(
        poiLocations
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

// Exports an empty array of MapLocation objects, which can be used as a default value or placeholder when there are no locations to display.
export const locations: MapLocation[] = [];
