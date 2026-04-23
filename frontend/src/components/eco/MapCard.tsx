import { GlassCard } from "./GlassCard";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Mapbox Token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const fetchMapReports = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/map`);
  if (!response.ok) throw new Error("Failed to fetch map data");
  return response.json();
};

const tabs = ["AQI", "Fire Data", "Reports"] as const;

const fetchZoneAQI = async (lat: number, lng: number) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/aqi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  });
  if (!response.ok) throw new Error("Failed to fetch zone AQI");
  const data = await response.json();
  return data.indexes[0].aqi;
};

function ZoneItem({ city }: { city: { name: string, lat: number, lng: number } }) {
  const { data: aqi, isLoading } = useQuery({
    queryKey: ["zone-aqi", city.name],
    queryFn: () => fetchZoneAQI(city.lat, city.lng),
    refetchInterval: 600000, // 10 mins
  });

  return (
    <div className="rounded-xl bg-black/40 p-2.5 backdrop-blur-md ring-1 ring-white/10 transition-all hover:bg-black/60">
      <p className="text-[10px] font-bold text-white/90">{city.name}</p>
      <p className="text-[8px] text-white/50 mt-0.5">AQI reading</p>
      <p className={cn(
        "text-lg font-bold leading-none mt-1",
        isLoading ? "animate-pulse text-white/20" :
          aqi && aqi > 200 ? "text-bad" :
            aqi && aqi > 100 ? "text-warn" : "text-good"
      )}>
        {isLoading ? "---" : aqi || "N/A"}
      </p>
    </div>
  );
}

export function MapCard() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Reports");

  const { data: geoJSON } = useQuery({
    queryKey: ["reports:geojson"],
    queryFn: fetchMapReports,
    refetchInterval: 5000, // Update every 5 seconds
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [78.9629, 22.5937], // India Center
      zoom: 4,
      attributionControl: false
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: false, // Don't auto-track every few seconds
      showUserLocation: true,
      showAccuracyCircle: true,
      fitBoundsOptions: { maxZoom: 17 }
    });

    mapRef.current.addControl(geolocate, "top-right");

    // Auto-trigger geolocation after a 5s delay on reload
    const timer = setTimeout(() => {
      geolocate.trigger();
    }, 5000);

    // If site stays open, fetch every 3 minutes
    const interval = setInterval(() => {
      geolocate.trigger();
    }, 180000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !geoJSON) return;

    const map = mapRef.current;

    const updateSource = () => {
      if (map.getSource('reports')) {
        (map.getSource('reports') as mapboxgl.GeoJSONSource).setData(geoJSON);
      } else {
        map.addSource('reports', {
          type: 'geojson',
          data: geoJSON
        });

        map.addLayer({
          id: 'reports-circle',
          type: 'circle',
          source: 'reports',
          paint: {
            'circle-radius': 6,
            'circle-color': [
              'match',
              ['get', 'status'],
              'high', '#ef4444',
              'med', '#f59e0b',
              'low', '#10b981',
              '#3b82f6' // default
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Click handler for popups
        map.on('click', 'reports-circle', (e) => {
          if (!e.features || !e.features[0]) return;

          const props = e.features[0].properties;
          const coordinates = (e.features[0].geometry as any).coordinates.slice();

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-2 text-slate-900 min-w-[150px]">
                <h3 class="font-bold text-sm border-b pb-1 mb-2">${props?.category.replace('_', ' ').toUpperCase()}</h3>
                <p class="text-[11px] leading-tight text-slate-600">${props?.summary || 'Civic report active'}</p>
                <img src="${props?.image_url.startsWith('http') ? props?.image_url : import.meta.env.VITE_API_URL + props?.image_url}" 
                     class="w-full h-24 object-cover mt-2 rounded-lg border border-slate-100 shadow-sm" />
              </div>
            `)
            .addTo(map);
        });

        // Hover effect
        map.on('mouseenter', 'reports-circle', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'reports-circle', () => {
          map.getCanvas().style.cursor = '';
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateSource();
    } else {
      map.on('load', updateSource);
    }

  }, [geoJSON]);

  return (
    <GlassCard className="h-[400px] overflow-hidden p-0 relative group">
      <div className="absolute top-4 left-4 z-10 flex items-start justify-between w-[calc(100%-32px)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 drop-shadow-md">Environmental map</p>
          <p className="text-sm font-medium text-white drop-shadow-md">India region · {geoJSON?.features?.length || 0} alerts</p>
        </div>

        <div className="flex rounded-full bg-black/30 backdrop-blur-md p-1 ring-1 ring-white/10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3 py-1 text-[10px] transition font-medium",
                tab === t ? "bg-white/20 text-white" : "text-white/50 hover:text-white",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div ref={mapContainerRef} className="h-full w-full bg-slate-900" />

      {/* Zones Overlay */}
      <div className="absolute right-4 top-16 bottom-12 z-10 w-32 space-y-2 overflow-y-auto pr-1 scrollbar-none">
        <p className="text-[9px] uppercase tracking-widest text-white/50 mb-2 font-bold px-1">Live Zones</p>
        {[
          { name: "Amritsar", lat: 31.634, lng: 74.872 },
          { name: "Ludhiana", lat: 30.901, lng: 75.857 },
          { name: "Jalandhar", lat: 31.326, lng: 75.576 },
          { name: "Patiala", lat: 30.340, lng: 76.387 }
        ].map(city => (
          <ZoneItem key={city.name} city={city} />
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-3 rounded-full bg-black/40 px-3 py-1.5 text-[9px] font-medium text-white backdrop-blur-md ring-1 ring-white/10">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#ef4444]" /> High
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#f59e0b]" /> Med
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#10b981]" /> Low
        </div>
      </div>
    </GlassCard>
  );
}