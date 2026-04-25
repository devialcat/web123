import { useT } from "@/i18n/LanguageContext";
import { Link } from "wouter";
import { SiZalo, SiKakaotalk, SiGmail, SiFacebook } from "react-icons/si";

export function Footer() {
  const { t } = useT();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-serif text-xl font-bold text-primary mb-4">Quốc Sách Driver</h3>
            <p className="text-muted-foreground max-w-sm">
              {t("home.heroSubtitle")}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">{t("nav.home")}</Link></li>
              <li><Link href="/destinations" className="hover:text-primary transition-colors">{t("nav.destinations")}</Link></li>
              <li><Link href="/map" className="hover:text-primary transition-colors">{t("nav.map")}</Link></li>
              <li><Link href="/tour-builder" className="hover:text-primary transition-colors">{t("nav.tourBuilder")}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="https://zalo.me/84905543050" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#0068FF] transition-colors">
                <SiZalo className="h-5 w-5" />
              </a>
              <a href="tel:+84905543050" className="text-muted-foreground hover:text-[#FEE500] transition-colors">
                <SiKakaotalk className="h-5 w-5" />
              </a>
              <a href="mailto:tranquocsach1992@gmail.com" className="text-muted-foreground hover:text-[#EA4335] transition-colors">
                <SiGmail className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/tranquocsach1992" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#1877F2] transition-colors">
                <SiFacebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Quốc Sách Driver. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-xs">Product by MMS</span>
            <Link href="/admin" className="hover:text-primary transition-colors text-xs opacity-60 hover:opacity-100">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
