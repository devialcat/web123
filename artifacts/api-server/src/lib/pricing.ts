export type City = "da-nang" | "hue" | "hoi-an";

export const RATE_CARD = {
  baseDailyPriceUsd: 75,
  currency: "USD",
  citySurcharges: [
    { city: "da-nang" as City, surchargeUsd: 0 },
    { city: "hoi-an" as City, surchargeUsd: 10 },
    { city: "hue" as City, surchargeUsd: 25 },
  ],
  extraPersonFeeUsd: 8,
  extraPersonThreshold: 4,
};

export interface PriceLineItem {
  label: string;
  amountUsd: number;
}

export interface PriceEstimate {
  days: number;
  peopleCount: number;
  baseTotalUsd: number;
  cityTotalUsd: number;
  peopleTotalUsd: number;
  totalUsd: number;
  currency: string;
  lineItems: PriceLineItem[];
}

function diffDaysInclusive(start: string, end: string): number {
  const s = new Date(start + "T00:00:00Z").getTime();
  const e = new Date(end + "T00:00:00Z").getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return 1;
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function estimate(input: {
  startDate: string;
  endDate: string;
  peopleCount: number;
  cities: City[];
}): PriceEstimate {
  const days = diffDaysInclusive(input.startDate, input.endDate);
  const peopleCount = Math.max(1, input.peopleCount);
  const uniqueCities = Array.from(new Set(input.cities)) as City[];

  const baseTotalUsd = round2(RATE_CARD.baseDailyPriceUsd * days);

  const lineItems: PriceLineItem[] = [
    {
      label: `Base driver service (${days} day${days === 1 ? "" : "s"} × $${RATE_CARD.baseDailyPriceUsd})`,
      amountUsd: baseTotalUsd,
    },
  ];

  let cityTotalUsd = 0;
  for (const city of uniqueCities) {
    const surcharge = RATE_CARD.citySurcharges.find((c) => c.city === city);
    if (surcharge && surcharge.surchargeUsd > 0) {
      const amt = round2(surcharge.surchargeUsd * days);
      cityTotalUsd += amt;
      const cityLabel =
        city === "hue"
          ? "Hue"
          : city === "hoi-an"
            ? "Hoi An"
            : "Da Nang";
      lineItems.push({
        label: `${cityLabel} long-distance fee ($${surcharge.surchargeUsd}/day)`,
        amountUsd: amt,
      });
    }
  }
  cityTotalUsd = round2(cityTotalUsd);

  let peopleTotalUsd = 0;
  if (peopleCount > RATE_CARD.extraPersonThreshold) {
    const extras = peopleCount - RATE_CARD.extraPersonThreshold;
    peopleTotalUsd = round2(extras * RATE_CARD.extraPersonFeeUsd * days);
    lineItems.push({
      label: `Group fee (${extras} extra guest${extras === 1 ? "" : "s"} × $${RATE_CARD.extraPersonFeeUsd}/day)`,
      amountUsd: peopleTotalUsd,
    });
  }

  const totalUsd = round2(baseTotalUsd + cityTotalUsd + peopleTotalUsd);

  return {
    days,
    peopleCount,
    baseTotalUsd,
    cityTotalUsd,
    peopleTotalUsd,
    totalUsd,
    currency: RATE_CARD.currency,
    lineItems,
  };
}
