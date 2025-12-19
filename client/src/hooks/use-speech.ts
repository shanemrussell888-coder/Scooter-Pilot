import { useCallback, useRef } from "react";

export function useSpeech() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser");
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 1;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 1;
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en-"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);
  
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);
  
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  
  return { speak, stop, isSupported };
}

export function formatNavigationInstruction(instruction: string, distance: number): string {
  const distanceText = distance < 100 
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
  const distanceText = distance < 100 
    ? `${Math.round(distance)} meters`
    : `${(distance / 1609.34).toFixed(1)} miles`;
  
  return `Charging station nearby: ${stationName}, ${distanceText} away.`;
}
