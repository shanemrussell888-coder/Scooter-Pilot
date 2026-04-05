import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, X, Navigation2, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMapStore } from "@/lib/mapStore";
import { useSpeech, formatNavigationInstruction, formatLaneAnnouncement } from "@/hooks/use-speech";
import { openInProvider } from "@/lib/map-integrations";
import { SiGooglemaps, SiApple, SiWaze } from "react-icons/si";

export function NavigationPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { speak, stop, isSupported } = useSpeech();
  const lastSpokenStepRef = useRef<number>(-1);
  const lastLaneTypeRef = useRef<string>("");

  const {
    isNavigating,
    setIsNavigating,
    activeRoute,
    currentStepIndex,
    setCurrentStepIndex,
    selectedSpeed,
    clearRoute,
    origin,
    destination,
    originName,
    destinationName,
    preferences,
  } = useMapStore();

  const currentSegment = activeRoute?.segments[currentStepIndex];
  const nextSegment = activeRoute?.segments[currentStepIndex + 1];
  const currentSpeedOption = activeRoute?.speedOptions?.find(
    (opt) => opt.category === selectedSpeed
  );

  useEffect(() => {
    if (!isNavigating || !activeRoute || !voiceEnabled || !isSupported) return;
    
    if (lastSpokenStepRef.current !== currentStepIndex && currentSegment) {
      const instruction = formatNavigationInstruction(
        currentSegment.instruction || "Continue straight",
        currentSegment.distance
      );
      speak(instruction);
      lastSpokenStepRef.current = currentStepIndex;
      
      if (currentSegment.laneType !== lastLaneTypeRef.current) {
        setTimeout(() => {
          if (voiceEnabled) {
            speak(formatLaneAnnouncement(currentSegment.laneType));
          }
        }, 2500);
        lastLaneTypeRef.current = currentSegment.laneType;
      }
    }
  }, [currentStepIndex, isNavigating, voiceEnabled, activeRoute, currentSegment, speak, isSupported]);

  useEffect(() => {
    if (isNavigating && voiceEnabled && isSupported && activeRoute) {
      speak("Navigation started. " + formatNavigationInstruction(
        activeRoute.segments[0]?.instruction || "Continue straight",
        activeRoute.segments[0]?.distance || 0
      ));
      lastSpokenStepRef.current = 0;
      lastLaneTypeRef.current = activeRoute.segments[0]?.laneType || "";
    }
    
    return () => {
      stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating]);

  if (!isNavigating || !activeRoute) return null;

  const handleEndNavigation = () => {
    if (voiceEnabled && isSupported) {
      speak("Navigation ended.");
    }
    setIsNavigating(false);
    clearRoute();
  };
  
  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    if (newState && isSupported) {
      speak("Voice navigation enabled.");
    } else {
      stop();
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 100) return `${Math.round(meters)} m`;
    const miles = meters / 1609.34;
    return miles < 0.1 ? `${Math.round(meters)} m` : `${miles.toFixed(1)} mi`;
  };

  return (
    <>
      {/* Collapsed Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <Card className="backdrop-blur-sm bg-card/95 shadow-xl overflow-hidden">
          {/* Main Navigation Info */}
          <div className="p-4 flex items-center gap-4">
            {/* Direction Arrow */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
              currentSegment?.laneType === "protected"
                ? "bg-green-500"
                : currentSegment?.laneType === "shared"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}>
              <Navigation2 className="h-8 w-8 text-white" />
            </div>

            {/* Current Instruction */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold truncate">
                {currentSegment?.instruction || "Continue straight"}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistance(currentSegment?.distance || 0)}</span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    currentSegment?.laneType === "protected"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : currentSegment?.laneType === "shared"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {currentSegment?.laneType === "protected"
                    ? "Bike Lane"
                    : currentSegment?.laneType === "shared"
                    ? "Shared"
                    : "No Lane"}
                </Badge>
              </div>
            </div>

            {/* ETA & Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right mr-2">
                <p className="text-xl font-bold text-primary">
                  {Math.round(currentSpeedOption?.estimatedMinutes || 0)}
                </p>
                <p className="text-xs text-muted-foreground">min</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                data-testid="button-toggle-nav-expand"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Turn List */}
          {isExpanded && (
            <div className="border-t max-h-60 overflow-y-auto">
              {activeRoute.segments.map((segment, index) => (
                <div
                  key={segment.id}
                  className={`p-3 flex items-center gap-3 border-b last:border-b-0 ${
                    index === currentStepIndex ? "bg-primary/5" : ""
                  } ${index < currentStepIndex ? "opacity-50" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      segment.laneType === "protected"
                        ? "bg-green-500 text-white"
                        : segment.laneType === "shared"
                        ? "bg-yellow-500 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      index === currentStepIndex ? "font-medium" : ""
                    }`}>
                      {segment.instruction || "Continue straight"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistance(segment.distance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Open in External Provider Row */}
          {origin && destination && (
            <div className="border-t px-3 py-2 bg-muted/20">
              <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide font-medium">
                Hand off to
              </p>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 gap-1.5 text-xs border-[#4285F4]/30 hover:bg-[#4285F4]/10"
                  onClick={() => openInProvider("google", { origin, destination, originName, destinationName })}
                  data-testid="button-handoff-google"
                  title="Continue in Google Maps"
                >
                  <SiGooglemaps className="h-3.5 w-3.5 text-[#4285F4]" />
                  Google
                  <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 gap-1.5 text-xs border-foreground/20 hover:bg-foreground/5"
                  onClick={() => openInProvider("apple", { origin, destination, originName, destinationName })}
                  data-testid="button-handoff-apple"
                  title="Continue in Apple Maps"
                >
                  <SiApple className="h-3.5 w-3.5" />
                  Apple
                  <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 gap-1.5 text-xs border-[#33CCFF]/30 hover:bg-[#33CCFF]/10"
                  onClick={() => openInProvider("waze", { origin, destination, originName, destinationName })}
                  data-testid="button-handoff-waze"
                  title="Continue in Waze"
                >
                  <SiWaze className="h-3.5 w-3.5 text-[#33CCFF]" />
                  Waze
                  <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                </Button>
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="border-t p-2 flex items-center justify-between gap-2 bg-muted/30">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleVoice}
              data-testid="button-toggle-voice"
              title={voiceEnabled ? "Mute voice" : "Enable voice"}
            >
              {voiceEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Step {currentStepIndex + 1} of {activeRoute.segments.length}
              </span>
            </div>

            <Button
              size="sm"
              variant="destructive"
              onClick={handleEndNavigation}
              data-testid="button-end-navigation"
            >
              <X className="h-4 w-4 mr-1" />
              End
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
