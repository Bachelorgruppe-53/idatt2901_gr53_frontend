import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { Colors } from "@/src/constants/Colors";

export interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  place: string;
  color?: string;
}

export interface PoiDto {
  title: string;
  lat: number;
  lon: number;
  description: string;
  place: string;
  points: number;
  color: number;
  area: string;
}

const COLOR_BY_CODE: Record<number, string> = {
  1: Colors.brand.sage,
  2: Colors.brand.lightGreen,
  3: Colors.brand.turquoise,
  4: Colors.brand.green,
  5: Colors.brand.yellow,
  6: Colors.brand.darkYellow,
  7: Colors.brand.orange,
  8: Colors.brand.brown,
  9: Colors.brand.red,
  10: Colors.brand.purple,
};

const mapPoiColorToBrandColor = (colorCode: number): string =>
  COLOR_BY_CODE[colorCode] ?? Colors.brand.darkBlue;

// Static fallback locations
const FALLBACK_LOCATIONS: MapLocation[] = [
  {
    id: "1",
    latitude: 63.420128,
    longitude: 10.387826,
    title: "Sykepleier",
    place: "Scann stolpen i 2. etasje for å låse opp yrket",
  },
  {
    id: "2",
    latitude: 63.421,
    longitude: 10.387826,
    title: "Lege",
    place: "Scann stolpen ved heisen i 4. etasje for å låse opp yrket",
    color: "purple",
  },
];

const poiDtoToMapLocation = (poi: PoiDto, index: number): MapLocation => ({
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

export const fetchLocations = async (): Promise<MapLocation[]> => {
  try {
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const url = `${baseUrl}/poi/all`;

    let userId = await ensureUserId();
    let response = await fetchPoiWithUserId(url, userId);

    // Self-heal if stored ID is stale/invalid
    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 400 && errorText.includes("Invalid UUID format")) {
        userId = await registerDevice();
        response = await fetchPoiWithUserId(url, userId);
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

    if (!Array.isArray(poiArray)) return FALLBACK_LOCATIONS;
    return poiArray.map(poiDtoToMapLocation);
  } catch (error) {
    console.error("Failed to fetch POI locations:", error);
    return FALLBACK_LOCATIONS;
  }
};

export const locations = FALLBACK_LOCATIONS;