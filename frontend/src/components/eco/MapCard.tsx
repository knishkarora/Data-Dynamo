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
      center: [75.8573, 30.901], // Ludhiana, Punjab
      zoom: 7,
      attributionControl: false
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true
    });

    mapRef.current.addControl(geolocate, "top-right");

    // Auto-trigger geolocation after a 3s delay
    const timer = setTimeout(() => {
      geolocate.trigger();
    }, 3000);

    return () => {
      clearTimeout(timer);
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
          <p className="text-sm font-medium text-white drop-shadow-md">Punjab region · {geoJSON?.features?.length || 0} alerts</p>
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