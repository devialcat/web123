import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useListLocations } from "@workspace/api-client-react";
import type { ListLocationsCity } from "@workspace/api-client-react";
import { LocationCategory } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { cityLabel, localizedDescription, localizedName, withBase } from "@/lib/localize";

export default function Destinations() {
  const { t } = useT();
  const { language } = useLanguage();
  const [cityFilter, setCityFilter] = useState<ListLocationsCity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: locations, isLoading } = useListLocations(
    cityFilter !== "all" ? { city: cityFilter } : {}
  );

  const filteredLocations = locations?.filter(
    loc => categoryFilter === "all" || loc.category === categoryFilter
  );

  const categories = Object.values(LocationCategory);

  return (
    <div className="container py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">{t("destinations.title")}</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={cityFilter === "all" ? "default" : "outline"} 
            onClick={() => setCityFilter("all")}
          >
            {t("destinations.allCities")}
          </Button>
          <Button 
            variant={cityFilter === "da-nang" ? "default" : "outline"} 
            onClick={() => setCityFilter("da-nang")}
          >
            Da Nang
          </Button>
          <Button 
            variant={cityFilter === "hue" ? "default" : "outline"} 
            onClick={() => setCityFilter("hue")}
          >
            Hue
          </Button>
          <Button 
            variant={cityFilter === "hoi-an" ? "default" : "outline"} 
            onClick={() => setCityFilter("hoi-an")}
          >
            Hoi An
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 md:ml-auto">
          <select 
            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:w-[180px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{t("destinations.allCategories")}</option>
            {categories.map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredLocations?.map((location) => {
            const name = localizedName(location, language);
            const desc = localizedDescription(location, language);

            return (
              <Link key={location.id} href={`/destinations/${location.id}`} className="group block">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                  <img
                    src={withBase(location.imageUrl)}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full capitalize">
                    {location.category}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-medium mb-1">
                  <MapPin className="h-3 w-3" />
                  <span>{cityLabel(location.city, language)}</span>
                </div>
                <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {desc}
                </p>
              </Link>
            );
          })}
        </div>
      )}
      
      {filteredLocations?.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No destinations found matching your filters.
        </div>
      )}
    </div>
  );
}
