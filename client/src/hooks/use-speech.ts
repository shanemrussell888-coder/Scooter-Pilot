import { useCallback, useRef } from "react";
import { useMapStore } from "@/lib/mapStore";
import type { Language } from "@/lib/mapStore";

const LANG_BCP47: Record<Language, string> = {
  en: "en-US",
  es: "es-ES",
  "zh-cmn": "zh-CN",
  "zh-yue": "zh-HK",
  vi: "vi-VN",
  tl: "fil-PH",
  ko: "ko-KR",
  fr: "fr-FR",
  ar: "ar-SA",
};

export function useSpeech() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { language } = useMapStore();

  const speak = useCallback(
    (text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
      if (!window.speechSynthesis) {
        console.warn("Speech synthesis not supported in this browser");
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 1;
      utterance.pitch = options?.pitch ?? 1;
      utterance.volume = options?.volume ?? 1;

      const targetLang = LANG_BCP47[language] || "en-US";
      utterance.lang = targetLang;

      const voices = window.speechSynthesis.getVoices();
      const exactMatch = voices.find((v) => v.lang === targetLang);
      const prefixMatch = voices.find((v) => v.lang.startsWith(targetLang.split("-")[0]));
      const fallback = voices.find((v) => v.lang.startsWith("en-"));
      const selectedVoice = exactMatch || prefixMatch || fallback;
      if (selectedVoice) utterance.voice = selectedVoice;

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  return { speak, stop, isSupported };
}

export function formatNavigationInstruction(instruction: string, distance: number): string {
  const distanceText =
    distance < 100
      ? `${Math.round(distance)} meters`
      : `${(distance / 1609.34).toFixed(1)} miles`;

  return `In ${distanceText}, ${instruction.toLowerCase()}`;
}

export function formatLaneAnnouncement(laneType: string): string {
  switch (laneType) {
    case "protected":
      return "You are entering a protected bike lane.";
    case "shared":
      return "Caution: Entering shared lane with vehicle traffic.";
    case "none":
      return "Warning: No dedicated bike lane ahead. Ride carefully.";
    default:
      return "";
  }
}

export function formatChargingStationAlert(stationName: string, distance: number): string {
  const distanceText =
    distance < 100
      ? `${Math.round(distance)} meters`
      : `${(distance / 1609.34).toFixed(1)} miles`;

  return `Charging station nearby: ${stationName}, ${distanceText} away.`;
}
