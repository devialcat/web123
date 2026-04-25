import { useState } from "react";
import { SiZalo, SiKakaotalk, SiFacebook, SiGmail } from "react-icons/si";
import { Phone, X } from "lucide-react";

const contacts = [
  {
    id: "zalo",
    href: "https://zalo.me/84905543050",
    label: "Zalo",
    icon: SiZalo,
    bg: "bg-[#0068FF]",
  },
  {
    id: "kakao",
    href: "tel:+84905543050",
    label: "KakaoTalk",
    icon: SiKakaotalk,
    bg: "bg-[#FEE500] text-black",
  },
  {
    id: "call",
    href: "tel:+84905543050",
    label: "Gọi ngay",
    icon: Phone,
    bg: "bg-emerald-500",
  },
  {
    id: "facebook",
    href: "https://www.facebook.com/nhao.zokiemseo",
    label: "Facebook",
    icon: SiFacebook,
    bg: "bg-[#1877F2]",
  },
  {
    id: "email",
    href: "mailto:tranquocsach1992@gmail.com",
    label: "Email",
    icon: SiGmail,
    bg: "bg-[#EA4335]",
  },
] as const;

export function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {contacts.map((c) => {
            const Icon = c.icon;
            const isExternal = c.href.startsWith("http");
            return (
              <a
                key={c.id}
                href={c.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="flex items-center gap-2 group"
                data-testid={`floating-contact-${c.id}`}
              >
                <span className="bg-white text-foreground text-sm font-medium px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                  {c.label}
                </span>
                <span
                  className={`${c.bg} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
                  aria-label={c.label}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </a>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        aria-label={open ? "Đóng liên hệ" : "Mở liên hệ"}
        data-testid="floating-contact-toggle"
      >
        {open ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
      </button>
    </div>
  );
}
