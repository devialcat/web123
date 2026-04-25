import type { Language } from "@/i18n/LanguageContext";

interface Localizable {
  nameEn?: string;
  nameVi?: string;
  nameKo?: string;
  descriptionEn?: string;
  descriptionVi?: string;
  descriptionKo?: string;
}

export function localizedName(loc: Localizable | undefined, lang: Language): string {
  if (!loc) return "";
  if (lang === "vi") return loc.nameVi || loc.nameEn || "";
  if (lang === "ko") return loc.nameKo || loc.nameEn || "";
  return loc.nameEn || "";
}

export function localizedDescription(loc: Localizable | undefined, lang: Language): string {
  if (!loc) return "";
  if (lang === "vi") return loc.descriptionVi || loc.descriptionEn || "";
  if (lang === "ko") return loc.descriptionKo || loc.descriptionEn || "";
  return loc.descriptionEn || "";
}

export function cityLabel(city: string, lang: Language): string {
  const map: Record<string, Record<Language, string>> = {
    "da-nang": { en: "Da Nang", vi: "Đà Nẵng", ko: "다낭" },
    "hue": { en: "Hue", vi: "Huế", ko: "후에" },
    "hoi-an": { en: "Hoi An", vi: "Hội An", ko: "호이안" },
  };
  return map[city]?.[lang] || city;
}

export function cityColor(city: string): string {
  const map: Record<string, string> = {
    "da-nang": "#0EA5E9",
    "hue": "#10B981",
    "hoi-an": "#EAB308",
  };
  return map[city] || "#64748B";
}

export function withBase(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = import.meta.env.BASE_URL || "/";
  const trimmed = url.startsWith("/") ? url.slice(1) : url;
  return `${base}${trimmed}`;
}
