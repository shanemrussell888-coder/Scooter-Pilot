import { Timer, Zap, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMapStore } from "@/lib/mapStore";
import type { SpeedOption, SpeedCategory } from "@shared/schema";

const SPEED_ICONS: Record<SpeedCategory, typeof Timer> = {
  slow: Timer,
  medium: Gauge,
  fast: Zap,
};

const SPEED_LABELS: Record<SpeedCategory, string> = {
  slow: "Leisurely",
  medium: "Balanced",
  fast: "Quick",
};

const SPEED_DESCRIPTIONS: Record<SpeedCategory, string> = {
  slow: "Relaxed pace, great for sightseeing",
  medium: "Standard commute speed",
  fast: "Maximum speed, experienced riders",
};

interface SpeedOptionCardsProps {
  speedOptions: SpeedOption[];
}

export function SpeedOptionCards({ speedOptions }: SpeedOptionCardsProps) {
  const { selectedSpeed, setSelectedSpeed } = useMapStore();

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground px-1">
        Select Your Speed
      </h3>
      <div className="grid gap-2">
        {speedOptions.map((option) => {
          const Icon = SPEED_ICONS[option.category];
          const isSelected = selectedSpeed === option.category;

          return (
            <Card
              key={option.category}
              onClick={() => setSelectedSpeed(option.category)}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover-elevate"
              }`}
              data-testid={`speed-option-${option.category}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {SPEED_LABELS[option.category]}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {option.speedRange.min}-{option.speedRange.max} mph
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {SPEED_DESCRIPTIONS[option.category]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      isSelected ? "text-primary" : ""
                    }`}
                  >
                    {formatTime(option.estimatedMinutes)}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
