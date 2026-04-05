import { X, Gauge, Map, Bike, Battery, Moon, Sun, AlertTriangle, Info, Heart, ExternalLink, FileText, Github, DollarSign, Briefcase, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useMapStore } from "@/lib/mapStore";
import type { SpeedCategory, MapProvider, ScooterType } from "@shared/schema";
import { SiGooglemaps, SiApple, SiWaze } from "react-icons/si";

const SPEED_OPTIONS: { value: SpeedCategory; label: string; range: string }[] = [
  { value: "slow", label: "Leisurely", range: "8-12 mph" },
  { value: "medium", label: "Balanced", range: "13-17 mph" },
  { value: "fast", label: "Quick", range: "18-22 mph" },
];

const MAP_PROVIDERS: { value: MapProvider; label: string; icon: typeof SiGooglemaps }[] = [
  { value: "google", label: "Google Maps", icon: SiGooglemaps },
  { value: "apple", label: "Apple Maps", icon: SiApple },
  { value: "waze", label: "Waze", icon: SiWaze },
];

const SCOOTER_TYPES: { value: ScooterType; label: string; description: string }[] = [
  { value: "standing", label: "Standing Scooter", description: "Standard kick scooter" },
  { value: "seated", label: "Seated Scooter", description: "Scooter with seat attachment" },
];

export function SettingsModal() {
  const { showSettings, setShowSettings, preferences, setPreferences } = useMapStore();

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Settings & Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.darkMode ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Better visibility at night
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={preferences.darkMode}
              onCheckedChange={(checked) => setPreferences({ darkMode: checked })}
              data-testid="switch-dark-mode"
            />
          </div>

          <Separator />

          {/* Default Speed */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-muted-foreground" />
              <Label>Default Speed Setting</Label>
            </div>
            <Select
              value={preferences.defaultSpeed}
              onValueChange={(value) => setPreferences({ defaultSpeed: value as SpeedCategory })}
            >
              <SelectTrigger data-testid="select-default-speed">
                <SelectValue placeholder="Select speed" />
              </SelectTrigger>
              <SelectContent>
                {SPEED_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.range}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Map Provider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-muted-foreground" />
              <Label>Preferred Map Provider</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MAP_PROVIDERS.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={preferences.preferredMapProvider === value ? "default" : "outline"}
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => setPreferences({ preferredMapProvider: value })}
                  data-testid={`button-map-provider-${value}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{label.split(" ")[0]}</span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Map display uses OpenStreetMap. Provider selection affects navigation links.
            </p>
          </div>

          <Separator />

          {/* Scooter Type */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-muted-foreground" />
              <Label>Scooter Type</Label>
            </div>
            <Select
              value={preferences.scooterType}
              onValueChange={(value) => setPreferences({ scooterType: value as ScooterType })}
            >
              <SelectTrigger data-testid="select-scooter-type">
                <SelectValue placeholder="Select scooter type" />
              </SelectTrigger>
              <SelectContent>
                {SCOOTER_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        - {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Battery Capacity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-muted-foreground" />
                <Label>Current Battery Level</Label>
              </div>
              <span className="text-sm font-medium">{preferences.batteryCapacity}%</span>
            </div>
            <Slider
              value={[preferences.batteryCapacity]}
              onValueChange={([value]) => setPreferences({ batteryCapacity: value })}
              max={100}
              step={5}
              className="w-full"
              data-testid="slider-battery"
            />
            <p className="text-xs text-muted-foreground">
              Set your current battery level for accurate destination estimates
            </p>
          </div>

          <Separator />

          {/* Lane Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <Label>Lane Safety Preferences</Label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Avoid routes without bike lanes</p>
                <p className="text-xs text-muted-foreground">
                  Prefer routes with dedicated or shared lanes
                </p>
              </div>
              <Switch
                checked={preferences.avoidNoLaneRoutes}
                onCheckedChange={(checked) => setPreferences({ avoidNoLaneRoutes: checked })}
                data-testid="switch-avoid-no-lanes"
              />
            </div>

            {preferences.avoidNoLaneRoutes && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Maximum no-lane segment</Label>
                  <span className="text-sm font-medium">{preferences.maxNoLanePercent}%</span>
                </div>
                <Slider
                  value={[preferences.maxNoLanePercent]}
                  onValueChange={([value]) => setPreferences({ maxNoLanePercent: value })}
                  max={100}
                  step={5}
                  className="w-full"
                  data-testid="slider-max-no-lane"
                />
                <p className="text-xs text-muted-foreground">
                  Routes with more than {preferences.maxNoLanePercent}% no-lane segments will be avoided
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Support the App */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <Label>Support ScooterNav</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              ScooterNav is free and open-source. If it's useful to you, please consider supporting the developers — every contribution keeps it growing.
            </p>

            <Card className="p-3 bg-gradient-to-br from-green-950/40 to-emerald-900/20 border-green-800/50">
              <p className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">Ways to Contribute</p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-green-700/50 hover:bg-green-900/30 text-foreground"
                  onClick={() => window.open("https://github.com/sponsors/shanemrussell888-coder", "_blank")}
                  data-testid="button-github-sponsors"
                >
                  <Github className="h-4 w-4 text-white flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium">GitHub Sponsors</p>
                    <p className="text-xs text-muted-foreground">Monthly or one-time sponsor</p>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-green-700/50 hover:bg-green-900/30 text-foreground"
                  onClick={() => window.open("https://cash.app/$ManSco0311", "_blank")}
                  data-testid="button-cashapp"
                >
                  <DollarSign className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium">CashApp</p>
                    <p className="text-xs text-muted-foreground">$ManSco0311</p>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-green-700/50 hover:bg-green-900/30 text-foreground"
                  onClick={() => window.open("https://github.com/shanemrussell888-coder", "_blank")}
                  data-testid="button-github-star"
                >
                  <Github className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Star on GitHub</p>
                    <p className="text-xs text-muted-foreground">Free way to show support</p>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </Button>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Business & Partnership Inquiries */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <Label>Business & Integration Inquiries</Label>
            </div>
            <Card className="p-3 bg-gradient-to-br from-blue-950/40 to-indigo-900/20 border-blue-800/50">
              <p className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wide">For Companies & Organizations</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Interested in licensing ScooterNav's routing engine, integrating it into your navigation platform, or discussing acquisition? M&S.co welcomes serious partnership inquiries from technology companies, mapping providers, and mobility platforms.
              </p>
              <p className="text-[10px] text-amber-400/90 leading-relaxed mb-3 border border-amber-700/40 rounded p-2 bg-amber-950/20">
                <strong>Legal Notice:</strong> All integration, licensing, or acquisition of ScooterNav requires a fully executed, signed, and notarized written agreement. No rights are granted by preliminary discussion. ScooterNav is proprietary software — all rights reserved.
              </p>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-blue-700/50 hover:bg-blue-900/30 text-foreground"
                onClick={() => window.open(
                  "mailto:shane.m.russell888@gmail.com?subject=ScooterNav%20Business%2FIntegration%20Inquiry&body=Company%20Name%3A%0AInquiry%20Type%20(Licensing%2FIntegration%2FAcquisition%2FPartnership)%3A%0ADetails%3A",
                  "_blank"
                )}
                data-testid="button-business-inquiry"
              >
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Submit a Business Inquiry</p>
                  <p className="text-xs text-muted-foreground">shane.m.russell888@gmail.com</p>
                </div>
                <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
              </Button>
            </Card>
          </div>

          <Separator />

          {/* About & Legal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <Label>About & Legal</Label>
            </div>

            {/* Ownership */}
            <Card className="p-3 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Ownership & Intellectual Property</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                ScooterNav is <strong>proprietary software</strong> exclusively owned by M&S.co — a partnership between <strong>Shane Matthew Russell</strong> and <strong>Manuel Hernandez</strong>.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                All source code, design, algorithms, and trade dress are protected under U.S. copyright law. No reproduction, redistribution, or commercial use is permitted without a signed and notarized agreement.
              </p>
              <p className="text-[10px] text-muted-foreground mb-2">© 2024 M&S.co — All Rights Reserved.</p>
              <div className="flex flex-col gap-1">
                <button
                  className="text-xs text-left text-primary hover:underline"
                  onClick={() => window.open("mailto:shane.m.russell888@gmail.com", "_blank")}
                  data-testid="link-contact-email"
                >
                  ✉ shane.m.russell888@gmail.com
                </button>
                <button
                  className="text-xs text-left text-primary hover:underline"
                  onClick={() => window.open("https://github.com/shanemrussell888-coder", "_blank")}
                  data-testid="link-github-profile"
                >
                  ⌥ github.com/shanemrussell888-coder
                </button>
              </div>
            </Card>

            {/* Liability Disclaimer */}
            <Card className="p-3 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-sm font-medium">Liability Disclaimer</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ScooterNav is provided "as is" without warranty of any kind. The creators, 
                owners, and contributors of ScooterNav shall not be held liable for any 
                direct, indirect, incidental, special, or consequential damages arising 
                from the use of this application. Users assume all risks associated with 
                operating electric scooters. Always follow local traffic laws, wear 
                appropriate safety gear, and ride responsibly. Navigation suggestions 
                are for informational purposes only - always use your own judgment and 
                observe road conditions.
              </p>
            </Card>

            {/* Terms of Use */}
            <p className="text-xs text-muted-foreground text-center">
              By using ScooterNav, you agree to these terms.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
