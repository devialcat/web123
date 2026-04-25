import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { useListLocations } from "@workspace/api-client-react";
import type { Location } from "@workspace/api-client-react";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  cityColor,
  cityLabel,
  localizedDescription,
  localizedName,
  withBase,
} from "@/lib/localize";
import { useItineraryStore, type LocationStore } from "@/lib/itinerary";
import { MapPin, Plus, ArrowRight } from "lucide-react";

const VIETNAM_CENTER = { lat: 16.2, lng: 108.1 };
const MAP_ID = "quoc-sach-map";
const CITIES: Array<"da-nang" | "hoi-an" | "hue"> = ["da-nang", "hoi-an", "hue"];

function MapController({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      map.panTo(target);
      map.setZoom(13);
    }
  }, [map, target]);
  return null;
}

function MapView({
  locations,
  apiKey,
}: {
  locations: Location[];
  apiKey: string;
}) {
  const { language } = useLanguage();
  const { t } = useT();
  const addLocation = useItineraryStore((s) => s.addLocation);
  const selected = useItineraryStore((s) => s.selectedLocations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [target, setTarget] = useState<{ lat: number; lng: number } | null>(null);

  const active = locations.find((l) => l.id === activeId) || null;

  const grouped = useMemo(() => {
    const out: Record<string, Location[]> = { "da-nang": [], "hoi-an": [], hue: [] };
    for (const l of locations) {
      out[l.city]?.push(l);
    }
    return out;
  }, [locations]);

  const handleFocus = (loc: Location) => {
    setActiveId(loc.id);
    setTarget({ lat: loc.lat, lng: loc.lng });
  };

  const handleAdd = (loc: Location) => {
    const store: LocationStore = {
      id: loc.id,
      nameEn: loc.nameEn,
      nameVi: loc.nameVi,
      nameKo: loc.nameKo,
      imageUrl: loc.imageUrl,
      city: loc.city as LocationStore["city"],
    };
    addLocation(store);
  };

  return (
    <APIProvider apiKey={apiKey}>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="border-r bg-background overflow-y-auto">
          <div className="p-6 border-b">
            <h1 className="font-serif text-2xl font-bold mb-1">{t("map.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("map.subtitle")}</p>
          </div>
          <div className="p-4 space-y-6">
            {CITIES.map((city) => (
              <div key={city}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: cityColor(city) }}
                  />
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    {cityLabel(city, language)}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({grouped[city]?.length || 0})
                  </span>
                </div>
                <ul className="space-y-1">
                  {grouped[city]?.map((loc) => (
                    <li key={loc.id}>
                      <button
                        type="button"
                        onClick={() => handleFocus(loc)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover-elevate active-elevate-2 ${
                          activeId === loc.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted"
                        }`}
                      >
                        {localizedName(loc, language)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Map */}
        <div className="relative h-full min-h-[500px]">
          <Map
            mapId={MAP_ID}
            defaultCenter={VIETNAM_CENTER}
            defaultZoom={9}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            <MapController target={target} />
            {locations.map((loc) => (
              <AdvancedMarker
                key={loc.id}
                position={{ lat: loc.lat, lng: loc.lng }}
                onClick={() => setActiveId(loc.id)}
              >
                <div
                  className="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    backgroundColor: cityColor(loc.city),
                    width: activeId === loc.id ? 28 : 22,
                    height: activeId === loc.id ? 28 : 22,
                    transition: "all 0.15s ease",
                  }}
                >
                  <MapPin
                    className="text-white"
                    style={{
                      width: activeId === loc.id ? 16 : 12,
                      height: activeId === loc.id ? 16 : 12,
                    }}
                  />
                </div>
              </AdvancedMarker>
            ))}
            {active && (
              <InfoWindow
                position={{ lat: active.lat, lng: active.lng }}
                onCloseClick={() => setActiveId(null)}
                pixelOffset={[0, -40]}
              >
                <div className="w-64">
                  <div className="aspect-video rounded-md overflow-hidden mb-2">
                    <img
                      src={withBase(active.imageUrl)}
                      alt={localizedName(active, language)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{cityLabel(active.city, language)}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">
                    {localizedName(active, language)}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                    {localizedDescription(active, language)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleAdd(active)}
                      disabled={selected.some((s) => s.id === active.id)}
                      data-testid={`button-add-${active.id}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {selected.some((s) => s.id === active.id)
                        ? t("destinations.added")
                        : t("destinations.addToItinerary")}
                    </Button>
                    <Link href={`/destinations/${active.id}`}>
                      <Button size="sm" variant="ghost" className="h-8 text-xs">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </div>
    </APIProvider>
  );
}

function FallbackList({ locations }: { locations: Location[] }) {
  const { language } = useLanguage();
  const { t } = useT();
  const addLocation = useItineraryStore((s) => s.addLocation);
  const selected = useItineraryStore((s) => s.selectedLocations);

  return (
    <div className="container py-12">
      <h1 className="font-serif text-3xl font-bold mb-2">{t("map.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("map.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <Card key={loc.id} className="overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={withBase(loc.imageUrl)}
                alt={localizedName(loc, language)}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full mb-2"
                style={{
                  backgroundColor: `${cityColor(loc.city)}20`,
                  color: cityColor(loc.city),
                }}
              >
                <MapPin className="h-3 w-3" />
                {cityLabel(loc.city, language)}
              </div>
              <h3 className="font-bold mb-1">{localizedName(loc, language)}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {localizedDescription(loc, language)}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addLocation({
                    id: loc.id,
                    nameEn: loc.nameEn,
                    nameVi: loc.nameVi,
                    nameKo: loc.nameKo,
                    imageUrl: loc.imageUrl,
                    city: loc.city as LocationStore["city"],
                  })
                }
                disabled={selected.some((s) => s.id === loc.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                {selected.some((s) => s.id === loc.id)
                  ? t("destinations.added")
                  : t("destinations.addToItinerary")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function MapPage() {
  const { data: locations } = useListLocations();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  if (!locations) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        Loading map…
      </div>
    );
  }

  if (!apiKey) {
    return <FallbackList locations={locations} />;
  }

  return <MapView locations={locations} apiKey={apiKey} />;
}
