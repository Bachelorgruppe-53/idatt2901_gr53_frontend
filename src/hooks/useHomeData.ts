import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import { subscribeToCareerClaimed } from "@/services/career/careerClaimEvents";
import { loadHomeSummary } from "@/services/home/loadHomeSummary";
import { getLanguageCode } from "@/services/language/languageCode";
import type { UserSummary } from "@/services/types/summary";
import {
  getFavoriteCareer,
  getNickname,
  type FavoriteCareer,
} from "@/services/utils/secureStorage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

/**
 * Custom hook to load and manage home screen data, including user summary and points.
 * Handles data fetching on app focus and at regular intervals, with safeguards against
 * race conditions. Also listens for app state changes to refresh data when the app becomes active.
 *
 * @returns An object containing the user's name, points, summary, class points, and a reload function to manually refresh the data.
 */

export function useHomeData() {
  const { i18n } = useTranslation();
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [classPoints, setClassPoints] = useState<number | null>(null);
  const [favoriteCareer, setFavoriteCareer] = useState<FavoriteCareer | null>(
    null,
  );

  const requestIdRef = useRef(0);

  const loadLocalizedFavoriteCareer = useCallback(
    async (
      favorite: FavoriteCareer | null,
      language: string,
    ): Promise<FavoriteCareer | null> => {
      if (!favorite) return null;

      try {
        const userId = await ensureUserId();
        const baseUrl = getApiBaseUrl().replace(/\/$/, "");
        const languageCode = getLanguageCode(language);

        const res = await fetch(
          `${baseUrl}/career/info/${encodeURIComponent(languageCode)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-User-ID": userId,
            },
            body: JSON.stringify({ id: favorite.id }),
          },
        );

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const json = (await res.json()) as { title?: string } | string;
        if (typeof json !== "string" && typeof json.title === "string") {
          return { id: favorite.id, title: json.title };
        }
      } catch {
        // Keep using cached favorite if translation refresh fails.
      }

      return favorite;
    },
    [],
  );

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const language = i18n.resolvedLanguage ?? i18n.language;

    const cached = await getNickname();
    const cachedFavorite = await getFavoriteCareer();
    if (requestId === requestIdRef.current && cached) {
      setName(cached);
    }
    if (requestId === requestIdRef.current) {
      setFavoriteCareer(cachedFavorite);
    }

    const localizedFavorite = await loadLocalizedFavoriteCareer(
      cachedFavorite,
      language,
    );
    if (requestId === requestIdRef.current) {
      setFavoriteCareer(localizedFavorite);
    }

    const data = await loadHomeSummary();

    if (requestId !== requestIdRef.current) return;
    setSummary(data.summary);
    setPoints(data.points);
    setClassPoints(data.classPoints);
    if (data.nickname) setName(data.nickname);
  }, [i18n.language, i18n.resolvedLanguage, loadLocalizedFavoriteCareer]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void reload();
    });
    return () => sub.remove();
  }, [reload]);

  useEffect(() => {
    const unsubscribe = subscribeToCareerClaimed(() => {
      void reload();
    });

    return unsubscribe;
  }, [reload]);

  return { name, points, summary, classPoints, favoriteCareer, reload };
}
