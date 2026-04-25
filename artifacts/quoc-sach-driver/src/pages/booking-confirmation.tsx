import { useParams, Link } from "wouter";
import {
  useGetBooking,
  useListLocations,
} from "@workspace/api-client-react";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cityLabel, localizedName, withBase } from "@/lib/localize";
import {
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Printer,
  Home as HomeIcon,
} from "lucide-react";
import { SiZalo, SiKakaotalk, SiGmail, SiFacebook } from "react-icons/si";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function BookingConfirmation() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useT();
  const { language } = useLanguage();

  const { data: booking, isLoading } = useGetBooking(id);
  const { data: locations } = useListLocations();

  const locById = new Map((locations || []).map((l) => [l.id, l]));

  if (isLoading || !booking) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-3xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
          {t("booking.successTitle")}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t("booking.successMessage")}
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {t("booking.bookingId")}
              </p>
              <p className="font-mono text-lg font-bold" data-testid="text-booking-id">
                {booking.id}
              </p>
            </div>
            <Badge
              variant="outline"
              className={statusColors[booking.status] || ""}
              data-testid="badge-status"
            >
              {t(`admin.${booking.status}`)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Dates</p>
                <p className="font-medium text-sm">{booking.startDate}</p>
                <p className="font-medium text-sm">{booking.endDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">People</p>
                <p className="font-medium">{booking.peopleCount}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Cities</p>
                <p className="font-medium text-sm">
                  {booking.cities.map((c) => cityLabel(c, language)).join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Itinerary</h3>
            <div className="space-y-4">
              {booking.itinerary.map((day) => (
                <div key={day.day}>
                  <h4 className="font-medium text-sm text-primary mb-2">
                    {t("tourBuilder.day")} {day.day}
                  </h4>
                  <div className="space-y-2">
                    {day.stops.map((stop) => {
                      const loc = locById.get(stop.locationId);
                      if (!loc) {
                        return (
                          <div key={stop.locationId} className="text-sm text-muted-foreground pl-4">
                            • {stop.locationId}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={stop.locationId}
                          className="flex items-center gap-3 p-2 rounded-lg border"
                        >
                          <img
                            src={withBase(loc.imageUrl)}
                            alt={localizedName(loc, language)}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <span className="text-sm font-medium">
                            {localizedName(loc, language)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {booking.message && (
            <div className="border-t mt-6 pt-6">
              <p className="text-xs text-muted-foreground mb-1">{t("booking.message")}</p>
              <p className="text-sm">{booking.message}</p>
            </div>
          )}

          <div className="border-t mt-6 pt-6 flex items-baseline justify-between">
            <span className="font-semibold">{t("tourBuilder.total")}</span>
            <span className="font-serif text-3xl font-bold text-primary">
              ${booking.totalUsd}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t("contact.title")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We'll reach out shortly. You can also message us directly:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="https://zalo.me/84905543050"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary transition-colors"
            >
              <SiZalo className="h-6 w-6 text-[#0068FF]" />
              <span className="text-xs">Zalo</span>
            </a>
            <a
              href="tel:+84905543050"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary transition-colors"
            >
              <SiKakaotalk className="h-6 w-6 text-[#FEE500]" />
              <span className="text-xs">KakaoTalk</span>
            </a>
            <a
              href="mailto:tranquocsach1992@gmail.com"
              className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary transition-colors"
            >
              <SiGmail className="h-6 w-6 text-[#EA4335]" />
              <span className="text-xs">Email</span>
            </a>
            <a
              href="https://facebook.com/tranquocsach1992"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary transition-colors"
            >
              <SiFacebook className="h-6 w-6 text-[#1877F2]" />
              <span className="text-xs">Facebook</span>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <Button variant="outline">
            <HomeIcon className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print this page
        </Button>
      </div>
    </div>
  );
}
