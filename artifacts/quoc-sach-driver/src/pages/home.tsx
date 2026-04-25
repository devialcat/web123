import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useListFeaturedLocations, useListReviews } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Star, Shield, Calendar, ArrowRight } from "lucide-react";
import { SiZalo, SiKakaotalk, SiGmail, SiFacebook } from "react-icons/si";
import { cityLabel, localizedDescription, localizedName, withBase } from "@/lib/localize";

export default function Home() {
  const { t } = useT();
  const { language } = useLanguage();
  const { data: featured } = useListFeaturedLocations();
  const { data: reviews } = useListReviews();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-danang.png" 
            alt="Da Nang Coastal Road" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container relative z-10 text-center text-white">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            {t("home.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/90 drop-shadow">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/tour-builder">
              <Button size="lg" className="text-base h-12 px-8 bg-primary hover:bg-primary/90">
                {t("home.buildTour")}
              </Button>
            </Link>
            <Link href="/destinations">
              <Button size="lg" variant="outline" className="text-base h-12 px-8 bg-white/10 hover:bg-white/20 border-white/30 text-white">
                {t("home.featuredDestinations")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("home.featuredDestinations")}
              </h2>
            </div>
            <Link href="/destinations" className="hidden sm:flex items-center text-primary hover:underline font-medium">
              {t("home.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured?.map((location) => {
              const name = localizedName(location, language);
              const desc = localizedDescription(location, language);

              return (
                <Link key={location.id} href={`/destinations/${location.id}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    <img
                      src={withBase(location.imageUrl)}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{cityLabel(location.city, language)}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {desc}
                  </p>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/destinations">
              <Button variant="outline" className="w-full">
                {t("home.viewAll")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-16">
            {t("home.whyChooseUs")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-4">{t("home.why1Title")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("home.why1Desc")}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-4">{t("home.why2Title")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("home.why2Desc")}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-4">{t("home.why3Title")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("home.why3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-16">
            {t("home.reviews")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews?.slice(0, 3).map((review) => (
              <div key={review.id} className="p-8 rounded-2xl bg-card border shadow-sm">
                <div className="flex gap-1 text-accent mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <h4 className="font-bold mb-2">{review.title}</h4>
                <p className="text-muted-foreground text-sm mb-6 flex-grow">"{review.body}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{review.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              {t("contact.title")}
            </h2>
            <p className="text-muted-foreground">{t("contact.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="https://zalo.me/84905543050"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border hover:border-primary transition-all hover:-translate-y-0.5"
              data-testid="link-home-zalo"
            >
              <SiZalo className="h-8 w-8 text-[#0068FF]" />
              <span className="text-sm font-medium">{t("contact.zalo")}</span>
            </a>
            <a
              href="tel:+84905543050"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border hover:border-primary transition-all hover:-translate-y-0.5"
              data-testid="link-home-kakao"
            >
              <SiKakaotalk className="h-8 w-8 text-[#FEE500]" />
              <span className="text-sm font-medium">{t("contact.kakao")}</span>
            </a>
            <a
              href="mailto:tranquocsach1992@gmail.com"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border hover:border-primary transition-all hover:-translate-y-0.5"
              data-testid="link-home-email"
            >
              <SiGmail className="h-8 w-8 text-[#EA4335]" />
              <span className="text-sm font-medium">{t("contact.email")}</span>
            </a>
            <a
              href="https://facebook.com/tranquocsach1992"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border hover:border-primary transition-all hover:-translate-y-0.5"
              data-testid="link-home-facebook"
            >
              <SiFacebook className="h-8 w-8 text-[#1877F2]" />
              <span className="text-sm font-medium">{t("contact.facebook")}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
