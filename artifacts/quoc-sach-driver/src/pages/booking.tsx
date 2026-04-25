import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import {
  useCreateBooking,
  useEstimatePrice,
} from "@workspace/api-client-react";
import type { City, BookingInput } from "@workspace/api-client-react";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useItineraryStore } from "@/lib/itinerary";
import { cityLabel } from "@/lib/localize";
import { Loader2, MapPin, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
}

interface PendingBooking {
  startDate: string;
  endDate: string;
  peopleCount: number;
  cities: City[];
  itinerary: Array<{ day: number; stops: Array<{ locationId: string; order: number }> }>;
  totalUsd: number;
}

export default function Booking() {
  const { t } = useT();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingBooking | null>(null);

  const { selectedLocations, clearItinerary } = useItineraryStore();
  const createBooking = useCreateBooking();
  const estimateMutation = useEstimatePrice();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const raw = localStorage.getItem("pending-booking");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PendingBooking;
        setPending(parsed);
        // Re-run estimate to get fresh line items
        if (
          parsed.startDate &&
          parsed.endDate &&
          parsed.peopleCount &&
          parsed.cities.length > 0
        ) {
          estimateMutation.mutate({
            data: {
              startDate: parsed.startDate,
              endDate: parsed.endDate,
              peopleCount: parsed.peopleCount,
              cities: parsed.cities,
            },
          });
        }
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itinerary = useMemo(() => {
    if (pending) return pending.itinerary;
    if (selectedLocations.length === 0) return [];
    return [
      {
        day: 1,
        stops: selectedLocations.map((l, i) => ({ locationId: l.id, order: i })),
      },
    ];
  }, [pending, selectedLocations]);

  const onSubmit = async (data: FormData) => {
    if (!pending) {
      toast({
        title: "Missing trip details",
        description: "Please go to the tour builder first.",
        variant: "destructive",
      });
      return;
    }

    const body: BookingInput = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      message: data.message || undefined,
      startDate: pending.startDate,
      endDate: pending.endDate,
      peopleCount: pending.peopleCount,
      cities: pending.cities,
      itinerary,
      language,
    };

    try {
      const result = await createBooking.mutateAsync({ data: body });
      localStorage.removeItem("pending-booking");
      clearItinerary();
      navigate(`/booking/${result.id}`);
    } catch (err) {
      toast({
        title: "Booking failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const estimate = estimateMutation.data;

  if (!pending) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-3xl font-bold mb-4">
          {t("booking.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          Please plan your trip first.
        </p>
        <Button onClick={() => navigate("/tour-builder")}>
          Build itinerary
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">
        {t("booking.title")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="font-serif text-xl font-bold">
                {t("booking.personalInfo")}
              </h2>

              <div>
                <Label htmlFor="customerName" className="mb-2 block">
                  {t("booking.name")}
                </Label>
                <Input
                  id="customerName"
                  {...register("customerName", { required: true })}
                  data-testid="input-customer-name"
                />
                {errors.customerName && (
                  <p className="text-xs text-destructive mt-1">Required</p>
                )}
              </div>

              <div>
                <Label htmlFor="customerEmail" className="mb-2 block">
                  {t("booking.email")}
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register("customerEmail", {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  })}
                  data-testid="input-customer-email"
                />
                {errors.customerEmail && (
                  <p className="text-xs text-destructive mt-1">Valid email required</p>
                )}
              </div>

              <div>
                <Label htmlFor="customerPhone" className="mb-2 block">
                  {t("booking.phone")}
                </Label>
                <Input
                  id="customerPhone"
                  {...register("customerPhone", { required: true })}
                  data-testid="input-customer-phone"
                />
                {errors.customerPhone && (
                  <p className="text-xs text-destructive mt-1">Required</p>
                )}
              </div>

              <div>
                <Label htmlFor="message" className="mb-2 block">
                  {t("booking.message")}
                </Label>
                <Textarea
                  id="message"
                  rows={4}
                  {...register("message")}
                  data-testid="input-message"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createBooking.isPending}
                data-testid="button-submit-booking"
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  t("booking.submit")
                )}
              </Button>
            </CardContent>
          </Card>
        </form>

        <aside>
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-bold mb-4">Trip Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{pending.startDate}</div>
                      <div className="text-muted-foreground">to {pending.endDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{pending.peopleCount} {pending.peopleCount === 1 ? "person" : "people"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {pending.cities.map((c) => (
                        <span
                          key={c}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {cityLabel(c, language)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {estimate && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-lg font-bold mb-4">
                    {t("tourBuilder.priceEstimate")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {estimate.lineItems.map((li, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{li.label}</span>
                        <span className="font-medium">${li.amountUsd}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between items-baseline">
                    <span className="font-semibold">{t("tourBuilder.total")}</span>
                    <span className="font-serif text-2xl font-bold text-primary">
                      ${estimate.totalUsd}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
