import { useT } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { SiZalo, SiKakaotalk, SiGmail, SiFacebook } from "react-icons/si";
import { Clock, MessageCircle } from "lucide-react";

const channels = [
  {
    id: "zalo",
    href: "https://zalo.me/84905123456",
    icon: SiZalo,
    color: "#0068FF",
    handle: "+84 90 512 3456",
  },
  {
    id: "kakao",
    href: "https://open.kakao.com/o/quocsachdriver",
    icon: SiKakaotalk,
    color: "#FEE500",
    handle: "@quocsachdriver",
  },
  {
    id: "email",
    href: "mailto:quocsachdriver@gmail.com",
    icon: SiGmail,
    color: "#EA4335",
    handle: "quocsachdriver@gmail.com",
  },
  {
    id: "facebook",
    href: "https://facebook.com/quocsachdriver",
    icon: SiFacebook,
    color: "#1877F2",
    handle: "facebook.com/quocsachdriver",
  },
] as const;

export default function Contact() {
  const { t } = useT();

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
          {t("contact.title")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("contact.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
        {channels.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.id}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noreferrer" : undefined}
              className="group block"
              data-testid={`link-contact-${c.id}`}
            >
              <Card className="h-full transition-all hover:shadow-md group-hover:-translate-y-0.5 duration-200">
                <CardContent className="p-6 flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${c.color}20`, color: c.color }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold mb-1">{t(`contact.${c.id}`)}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {c.handle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Hours</h3>
              <p className="text-sm text-muted-foreground">
                Daily, 6:00 AM – 10:00 PM (ICT)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Response time</h3>
              <p className="text-sm text-muted-foreground">
                Usually within 1 hour during business hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
