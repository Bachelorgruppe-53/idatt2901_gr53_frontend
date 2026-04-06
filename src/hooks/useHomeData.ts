import { loadHomeSummary } from "@/services/home/loadHomeSummary";
import type { UserSummary } from "@/services/types/summary";
import { getNickname } from "@/services/utils/secureStorage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

/**
 * Custom hook to load and manage home screen data, including user summary and points.
 * Handles data fetching on app focus and at regular intervals, with safeguards against
 * race conditions. Also listens for app state changes to refresh data when the app becomes active.
 *
 * @returns An object containing the user's name, points, summary, class points, and a reload function to manually refresh the data.
 */

export function useHomeData() {
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [classPoints, setClassPoints] = useState<number | null>(null);

  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    const cached = await getNickname();
    if (requestId === requestIdRef.current && cached) {
      setName(cached);
    }

    const data = await loadHomeSummary();

    if (requestId !== requestIdRef.current) return;
    setSummary(data.summary);
    setPoints(data.points);
    setClassPoints(data.classPoints);
    if (data.nickname) setName(data.nickname);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload();
      const interval = setInterval(() => void reload(), 15000);
      return () => clearInterval(interval);
    }, [reload]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void reload();
    });
    return () => sub.remove();
  }, [reload]);

  return { name, points, summary, classPoints, reload };
}
