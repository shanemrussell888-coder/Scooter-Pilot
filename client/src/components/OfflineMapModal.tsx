import { useState, useEffect, useCallback } from "react";
import { Download, Trash2, WifiOff, CheckCircle, X, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMapStore } from "@/lib/mapStore";

interface OfflineRegion {
  id: string;
  name: string;
  center: [number, number];
  zoom: [number, number];
  tileCount: number;
}

const PRESET_REGIONS: OfflineRegion[] = [
  { id: "nyc", name: "New York City", center: [40.7128, -74.006], zoom: [12, 16], tileCount: 0 },
  { id: "la", name: "Los Angeles", center: [34.0522, -118.2437], zoom: [12, 16], tileCount: 0 },
  { id: "chicago", name: "Chicago", center: [41.8781, -87.6298], zoom: [12, 16], tileCount: 0 },
  { id: "sf", name: "San Francisco", center: [37.7749, -122.4194], zoom: [12, 16], tileCount: 0 },
  { id: "miami", name: "Miami", center: [25.7617, -80.1918], zoom: [12, 16], tileCount: 0 },
  { id: "houston", name: "Houston", center: [29.7604, -95.3698], zoom: [12, 16], tileCount: 0 },
];

function generateTileUrls(center: [number, number], zoomRange: [number, number]): string[] {
  const urls: string[] = [];
  const tileUrl = (z: number, x: number, y: number) =>
    `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;

  for (let z = zoomRange[0]; z <= Math.min(zoomRange[1], 14); z++) {
    const n = Math.pow(2, z);
    const lat = (center[0] * Math.PI) / 180;
    const cx = Math.floor(((center[1] + 180) / 360) * n);
    const cy = Math.floor(
      ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * n
    );
    const radius = Math.max(1, Math.floor(3 / (z - zoomRange[0] + 1)));
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const tx = ((cx + dx) % n + n) % n;
        const ty = ((cy + dy) % n + n) % n;
        urls.push(tileUrl(z, tx, ty));
      }
    }
  }
  return urls;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function OfflineMapModal({ open, onClose }: Props) {
  const { currentLocation } = useMapStore();
  const [cachedCount, setCachedCount] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    const sw = navigator.serviceWorker?.controller;
    setSwReady(!!sw);

    if (sw) {
      sw.postMessage({ type: "GET_CACHE_SIZE" });
    }

    const onMsg = (event: MessageEvent) => {
      if (event.data?.type === "CACHE_SIZE") {
        setCachedCount(event.data.count);
      }
      if (event.data?.type === "CACHE_PROGRESS") {
        setDownloadProgress(event.data.cached);
        setDownloadTotal(event.data.total);
      }
      if (event.data?.type === "CACHE_COMPLETE") {
        setDownloadingId(null);
        setDownloadProgress(0);
        setCachedCount((c) => c + event.data.cached);
      }
      if (event.data?.type === "CACHE_CLEARED") {
        setCachedCount(0);
        setCompletedIds(new Set());
      }
    };

    navigator.serviceWorker?.addEventListener("message", onMsg);
    return () => navigator.serviceWorker?.removeEventListener("message", onMsg);
  }, [open]);

  const downloadRegion = useCallback(
    (region: OfflineRegion) => {
      const sw = navigator.serviceWorker?.controller;
      if (!sw) return;
      const tiles = generateTileUrls(region.center, region.zoom);
      setDownloadingId(region.id);
      setDownloadProgress(0);
      setDownloadTotal(tiles.length);
      sw.postMessage({ type: "CACHE_REGION", tiles });
      setCompletedIds((prev) => new Set([...prev, region.id]));
    },
    []
  );

  const downloadCurrentArea = useCallback(() => {
    if (!currentLocation) return;
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return;
    const region: OfflineRegion = {
      id: "current",
      name: "Current Area",
      center: [currentLocation.lat, currentLocation.lng],
      zoom: [12, 15],
      tileCount: 0,
    };
    downloadRegion(region);
  }, [currentLocation, downloadRegion]);

  const clearCache = useCallback(() => {
    const sw = navigator.serviceWorker?.controller;
    if (sw) sw.postMessage({ type: "CLEAR_TILE_CACHE" });
  }, []);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[80vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-teal-500" />
            <h2 className="font-bold text-foreground">Offline Maps</h2>
            {cachedCount > 0 && (
              <Badge variant="secondary" className="text-xs" data-testid="badge-cached-count">
                {cachedCount} tiles cached
              </Badge>
            )}
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-offline">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* SW status notice */}
        {!swReady && (
          <div className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-600 dark:text-amber-400">
            Offline caching activates after first page reload. Tiles already viewed are cached automatically.
          </div>
        )}

        {/* Download progress bar */}
        {downloadingId && (
          <div className="mx-4 mt-3 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
              <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                Downloading tiles… {downloadProgress}/{downloadTotal}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: downloadTotal ? `${(downloadProgress / downloadTotal) * 100}%` : "0%" }}
              />
            </div>
          </div>
        )}

        {/* Current Area button */}
        {currentLocation && (
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <Button
              className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={downloadCurrentArea}
              disabled={!!downloadingId}
              data-testid="button-download-current-area"
            >
              <MapPin className="w-4 h-4" />
              Download Current Area
            </Button>
          </div>
        )}

        {/* Divider */}
        <p className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">
          City Presets
        </p>

        {/* Regions list */}
        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {PRESET_REGIONS.map((region) => (
            <div
              key={region.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
              data-testid={`offline-region-${region.id}`}
            >
              <div className="flex items-center gap-3">
                {completedIds.has(region.id) ? (
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{region.name}</p>
                  <p className="text-xs text-muted-foreground">Zoom 12–14 · ~120 tiles</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={completedIds.has(region.id) ? "outline" : "secondary"}
                onClick={() => downloadRegion(region)}
                disabled={!!downloadingId}
                data-testid={`button-download-${region.id}`}
              >
                {downloadingId === region.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : completedIds.has(region.id) ? (
                  "Re-sync"
                ) : (
                  "Download"
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cachedCount > 0 && (
          <div className="border-t p-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 gap-2"
              onClick={clearCache}
              disabled={!!downloadingId}
              data-testid="button-clear-tile-cache"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Cached Tiles ({cachedCount})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
