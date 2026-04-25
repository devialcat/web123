import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  useListLocations,
  useEstimatePrice,
  useGetPricingRates,
} from "@workspace/api-client-react";
import type { Location, City } from "@workspace/api-client-react";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useItineraryStore, type LocationStore } from "@/lib/itinerary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  cityColor,
  cityLabel,
  localizedName,
  withBase,
} from "@/lib/localize";
import {
  Calendar as CalendarIcon,
  Users,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
} from "lucide-react";

function toIso(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

function fromInputValue(v: string): Date | null {
  if (!v) return null;
  return new Date(v + "T00:00:00");
}

export default function TourBuilder() {
  const { t } = useT();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cityFilter, setCityFilter] = useState<"all" | City>("all");

  const {
    startDate,
    endDate,
    peopleCount,
    selectedLocations,
    days,
    setDates,
    setPeopleCount,
    addLocation,
    removeLocation,
    assignStopToDay,
  } = useItineraryStore();

  const { data: allLocations } = useListLocations();
  const { data: rates } = useGetPricingRates();
  const estimateMutation = useEstimatePrice();

  const cities = useMemo<City[]>(() => {
    const set = new Set<City>();
    selectedLocations.forEach((l) => set.add(l.city as City));
    return Array.from(set);
  }, [selectedLocations]);

  // Trigger estimate when key inputs change
  useEffect(() => {
    if (startDate && endDate && peopleCount > 0 && cities.length > 0) {
      estimateMutation.mutate({
        data: {
          startDate: toIso(startDate),
          endDate: toIso(endDate),
          peopleCount,
          cities,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate?.toString(), endDate?.toString(), peopleCount, cities.join(",")]);

  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const ms = endDate.getTime() - startDate.getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
  }, [startDate, endDate]);

  const filteredLocations = useMemo(() => {
    if (!allLocations) return [];
    if (cityFilter === "all") return allLocations;
    return allLocations.filter((l) => l.city === cityFilter);
  }, [allLocations, cityFilter]);

  const isInItinerary = (id: string) =>
    selectedLocations.some((l) => l.id === id);

  const handleAdd = (loc: Location) => {
    addLocation({
      id: loc.id,
      nameEn: loc.nameEn,
      nameVi: loc.nameVi,
      nameKo: loc.nameKo,
      imageUrl: loc.imageUrl,
      city: loc.city as LocationStore["city"],
    });
  };

  const stopsByDay = useMemo(() => {
    const map = new Map<number, LocationStore[]>();
    days.forEach((d) => {
      const stops = d.stops
        .map((s) => selectedLocations.find((l) => l.id === s.locationId))
        .filter((l): l is LocationStore => !!l);
      if (stops.length > 0) map.set(d.day, stops);
    });
    return map;
  }, [days, selectedLocations]);

  const unassigned = useMemo(() => {
    const assigned = new Set(
      days.flatMap((d) => d.stops.map((s) => s.locationId)),
    );
    return selectedLocations.filter((l) => !assigned.has(l.id));
  }, [days, selectedLocations]);

  const findCurrentDay = (locationId: string): number | "" => {
    for (const d of days) {
      if (d.stops.some((s) => s.locationId === locationId)) return d.day;
    }
    return "";
  };

  const handleContinueToBooking = () => {
    if (!startDate || !endDate || selectedLocations.length === 0) return;
    const itinerary =
      days.length > 0
        ? days.map((d) => ({
            day: d.day,
            stops: d.stops.map((s, i) => ({
              locationId: s.locationId,
              order: i,
            })),
          }))
        : [
            {
              day: 1,
              stops: selectedLocations.map((l, i) => ({
                locationId: l.id,
                order: i,
              })),
            },
          ];

    const payload = {
      startDate: toIso(startDate),
      endDate: toIso(endDate),
      peopleCount,
      cities,
      itinerary,
      totalUsd: estimateMutation.data?.totalUsd ?? 0,
    };
    localStorage.setItem("pending-booking", JSON.stringify(payload));
    navigate("/booking");
  };

  const estimate = estimateMutation.data;
  const canContinue =
    !!startDate && !!endDate && selectedLocations.length > 0 && cities.length > 0;

  return (
    <div className="container py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
        {t("tourBuilder.title")}
      </h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10 mt-6">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s as 1 | 2 | 3)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              step === s
                ? "bg-primary text-primary-foreground"
                : step > s
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {step > s ? <Check className="h-4 w-4" /> : <span>{s}</span>}
            {t(`tourBuilder.step${s}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          {step === 1 && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="start-date" className="mb-2 block">
                      <CalendarIcon className="inline h-4 w-4 mr-1" />
                      {t("tourBuilder.dates")} (Start)
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={toIso(startDate)}
                      onChange={(e) =>
                        setDates(fromInputValue(e.target.value), endDate)
                      }
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="mb-2 block">
                      <CalendarIcon className="inline h-4 w-4 mr-1" />
                      {t("tourBuilder.dates")} (End)
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={toIso(endDate)}
                      min={toIso(startDate)}
                      onChange={(e) =>
                        setDates(startDate, fromInputValue(e.target.value))
                      }
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="people" className="mb-2 block">
                    <Users className="inline h-4 w-4 mr-1" />
                    {t("tourBuilder.people")}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                    >
                      <X className="h-4 w-4 rotate-45" />
                    </Button>
                    <Input
                      id="people"
                      type="number"
                      min={1}
                      max={20}
                      value={peopleCount}
                      onChange={(e) =>
                        setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 text-center"
                      data-testid="input-people-count"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPeopleCount(peopleCount + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {rates && peopleCount > rates.extraPersonThreshold && (
                      <span className="text-xs text-muted-foreground">
                        +${rates.extraPersonFeeUsd}/person beyond {rates.extraPersonThreshold}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!startDate || !endDate}
                    data-testid="button-step-1-next"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <div>
              <Tabs
                value={cityFilter}
                onValueChange={(v) => setCityFilter(v as typeof cityFilter)}
                className="mb-6"
              >
                <TabsList>
                  <TabsTrigger value="all">{t("destinations.allCities")}</TabsTrigger>
                  <TabsTrigger value="da-nang">{cityLabel("da-nang", language)}</TabsTrigger>
                  <TabsTrigger value="hoi-an">{cityLabel("hoi-an", language)}</TabsTrigger>
                  <TabsTrigger value="hue">{cityLabel("hue", language)}</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLocations.map((loc) => (
                  <Card key={loc.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={withBase(loc.imageUrl)}
                          alt={localizedName(loc, language)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div
                            className="inline-flex items-center gap-1 text-xs mb-1"
                            style={{ color: cityColor(loc.city) }}
                          >
                            <MapPin className="h-3 w-3" />
                            {cityLabel(loc.city, language)}
                          </div>
                          <h3 className="font-bold text-sm">
                            {localizedName(loc, language)}
                          </h3>
                        </div>
                        <Button
                          size="sm"
                          variant={isInItinerary(loc.id) ? "secondary" : "default"}
                          onClick={() =>
                            isInItinerary(loc.id)
                              ? removeLocation(loc.id)
                              : handleAdd(loc)
                          }
                          className="self-start mt-2"
                          data-testid={`button-toggle-${loc.id}`}
                        >
                          {isInItinerary(loc.id) ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              {t("destinations.added")}
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              {t("destinations.addToItinerary")}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedLocations.length === 0}
                  data-testid="button-step-2-next"
                >
                  Arrange ({selectedLocations.length}) <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {Array.from({ length: Math.max(dayCount, 1) }).map((_, idx) => {
                const dayNum = idx + 1;
                const stops = stopsByDay.get(dayNum) || [];
                return (
                  <Card key={dayNum}>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-bold mb-4">
                        {t("tourBuilder.day")} {dayNum}
                      </h3>
                      {stops.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No stops assigned yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {stops.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center gap-3 p-3 rounded-lg border"
                            >
                              <img
                                src={withBase(s.imageUrl)}
                                alt={localizedName(s, language)}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <span className="flex-1 font-medium text-sm">
                                {localizedName(s, language)}
                              </span>
                              <span
                                className="text-xs px-2 py-1 rounded-full"
                                style={{
                                  backgroundColor: `${cityColor(s.city)}20`,
                                  color: cityColor(s.city),
                                }}
                              >
                                {cityLabel(s.city, language)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLocation(s.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {unassigned.length > 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-lg font-bold mb-4">
                      {t("tourBuilder.unassigned")}
                    </h3>
                    <div className="space-y-2">
                      {unassigned.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                        >
                          <img
                            src={withBase(s.imageUrl)}
                            alt={localizedName(s, language)}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <span className="flex-1 font-medium text-sm">
                            {localizedName(s, language)}
                          </span>
                          <Select
                            value={String(findCurrentDay(s.id) || "")}
                            onValueChange={(v) =>
                              assignStopToDay(s.id, parseInt(v))
                            }
                          >
                            <SelectTrigger className="w-32" data-testid={`select-day-${s.id}`}>
                              <SelectValue placeholder={t("tourBuilder.day")} />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: Math.max(dayCount, 1) }).map(
                                (_, i) => (
                                  <SelectItem key={i} value={String(i + 1)}>
                                    {t("tourBuilder.day")} {i + 1}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLocation(s.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleContinueToBooking}
                  disabled={!canContinue}
                  data-testid="button-continue-to-booking"
                >
                  {t("tourBuilder.continueToBooking")}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Live Estimate */}
        <aside>
          <div className="sticky top-20">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-bold mb-4">
                  {t("tourBuilder.priceEstimate")}
                </h3>
                {estimate ? (
                  <div className="space-y-3">
                    <div className="text-sm space-y-2">
                      {estimate.lineItems.map((li, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{li.label}</span>
                          <span className="font-medium">${li.amountUsd}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3 flex justify-between items-baseline">
                      <span className="font-semibold">{t("tourBuilder.total")}</span>
                      <span className="font-serif text-2xl font-bold text-primary" data-testid="text-estimate-total">
                        ${estimate.totalUsd}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                      {estimate.days} {estimate.days === 1 ? "day" : "days"} •{" "}
                      {estimate.peopleCount} {estimate.peopleCount === 1 ? "person" : "people"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pick dates and add stops to see a live estimate.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="font-semibold text-sm mb-3">
                  {t("tourBuilder.selectedStops")} ({selectedLocations.length})
                </h3>
                {selectedLocations.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    None yet. Browse and add some.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {selectedLocations.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: cityColor(s.city) }}
                        />
                        <span className="flex-1 truncate">
                          {localizedName(s, language)}
                        </span>
                        <button
                          onClick={() => removeLocation(s.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
