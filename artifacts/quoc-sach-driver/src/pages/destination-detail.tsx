import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useGetLocation, getGetLocationQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Plus, Check } from "lucide-react";
import { useItineraryStore } from "@/lib/itinerary";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useT();
  const { language } = useLanguage();
  
  const { data: location, isLoading } = useGetLocation(id || "", {
    query: {
      enabled: !!id,
      queryKey: getGetLocationQueryKey(id || "")
    }
  });

  const addLocation = useItineraryStore(state => state.addLocation);
  const selectedLocations = useItineraryStore(state => state.selectedLocations);
  
  const isAdded = selectedLocations.some(l => l.id === id);

  if (isLoading) {
    return <div className="container py-12 animate-pulse h-[60vh] bg-muted rounded-xl mt-8"></div>;
  }

  if (!location) {
    return <div className="container py-20 text-center">Destination not found</div>;
  }

  const name = language === 'vi' ? location.nameVi : language === 'ko' ? location.nameKo : location.nameEn;
  const desc = language === 'vi' ? location.descriptionVi : language === 'ko' ? location.descriptionKo : location.descriptionEn;
  
  const handleAdd = () => {
    addLocation({
      id: location.id,
      nameEn: location.nameEn,
      nameVi: location.nameVi,
      nameKo: location.nameKo,
      imageUrl: location.imageUrl,
      city: location.city
    });
  };

  const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div>
      <div className="h-[40vh] md:h-[50vh] relative">
        <img 
          src={location.imageUrl} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white container">
          <div className="flex items-center gap-2 text-white/80 font-medium mb-2">
            <MapPin className="h-4 w-4" />
            <span className="capitalize">{location.city.replace('-', ' ')}</span>
            <span>•</span>
            <span className="capitalize">{location.category}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold drop-shadow-md">
            {name}
          </h1>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {desc}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-card border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Suggested Duration</div>
                  <div className="font-medium">{Math.floor(location.durationMinutes / 60)}h {location.durationMinutes % 60 > 0 ? `${location.durationMinutes % 60}m` : ''}</div>
                </div>
              </div>
              
              <Button 
                className="w-full h-12 text-base" 
                onClick={handleAdd}
                disabled={isAdded}
                variant={isAdded ? "secondary" : "default"}
              >
                {isAdded ? (
                  <><Check className="mr-2 h-5 w-5" /> {t("destinations.added")}</>
                ) : (
                  <><Plus className="mr-2 h-5 w-5" /> {t("destinations.addToItinerary")}</>
                )}
              </Button>
              
              {isAdded && (
                <Link href="/tour-builder">
                  <Button variant="link" className="w-full mt-2">
                    Go to Itinerary Builder
                  </Button>
                </Link>
              )}
            </div>

            <div className="rounded-xl overflow-hidden h-[300px] border shadow-sm relative">
              {mapApiKey ? (
                <APIProvider apiKey={mapApiKey}>
                  <Map 
                    defaultCenter={{ lat: location.lat, lng: location.lng }} 
                    defaultZoom={14}
                    mapId="destination-map"
                    disableDefaultUI
                  >
                    <AdvancedMarker position={{ lat: location.lat, lng: location.lng }} />
                  </Map>
                </APIProvider>
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center p-6 text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mb-2 mx-auto text-primary" />
                  <p>Map view unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
